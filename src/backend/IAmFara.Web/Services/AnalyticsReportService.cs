using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using IAmFara.Web.Data;
using IAmFara.Web.Data.Entities;
using IAmFara.Web.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace IAmFara.Web.Services;

public enum AnalyticsReportOutcome
{
    Sent,
    AlreadySent,
    NotConfigured,
}

public record AnalyticsReportResult(AnalyticsReportOutcome Outcome, DateOnly ReportDate);

/// <summary>
/// Computes yesterday's (Europe/Oslo) aggregates from raw AnalyticsVisit rows, emails
/// an HTML summary via the Resend HTTP API (same integration as the contact form,
/// extended here to also send an html body), and records durable aggregate rows plus
/// an idempotency marker so retries (GitHub Actions re-runs, manual re-triggers) never
/// send a second email for the same reporting day.
/// </summary>
public class AnalyticsReportService(
    AnalyticsDbContext db,
    HttpClient http,
    IOptions<ResendOptions> resendOptions,
    IOptions<AnalyticsOptions> analyticsOptions,
    ILogger<AnalyticsReportService> logger)
{
    private const int TopPagesLimit = 10;
    private const int RetentionDays = 30;

    private readonly ResendOptions _resend = resendOptions.Value;
    private readonly AnalyticsOptions _analytics = analyticsOptions.Value;

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_resend.ApiKey)
        && !string.IsNullOrWhiteSpace(_resend.FromEmail)
        && !string.IsNullOrWhiteSpace(_analytics.ReportToEmail);

    public async Task<AnalyticsReportResult> RunAsync(CancellationToken ct)
    {
        return await RunForDateAsync(OsloClock.PreviousOsloDate(DateTime.UtcNow), ct);
    }

    internal async Task<AnalyticsReportResult> RunForDateAsync(DateOnly reportDate, CancellationToken ct)
    {
        var existing = await db.ReportRuns
            .FirstOrDefaultAsync(r => r.ReportDate == reportDate, ct);

        if (existing is { Status: AnalyticsReportStatus.Success })
        {
            return new AnalyticsReportResult(AnalyticsReportOutcome.AlreadySent, reportDate);
        }

        if (!IsConfigured)
        {
            logger.LogWarning("Analytics report requested but Resend/Analytics options are not configured");
            return new AnalyticsReportResult(AnalyticsReportOutcome.NotConfigured, reportDate);
        }

        var (startUtc, endUtc) = OsloClock.OsloDayRangeUtc(reportDate);

        var visits = await db.Visits
            .Where(v => v.OccurredAtUtc >= startUtc && v.OccurredAtUtc < endUtc)
            .Select(v => new { v.CountryCode, v.NormalizedPath, v.DailyVisitorKey })
            .ToListAsync(ct);

        var pageViewCount = visits.Count;
        var uniqueVisitorCount = visits.Select(v => v.DailyVisitorKey).Distinct().Count();

        var countryBreakdown = visits
            .GroupBy(v => v.CountryCode)
            .Select(g => new AnalyticsDailyCountryBreakdown
            {
                LocalDate = reportDate,
                CountryCode = g.Key,
                PageViewCount = g.Count(),
                UniqueVisitorCount = g.Select(v => v.DailyVisitorKey).Distinct().Count(),
            })
            .OrderByDescending(c => c.PageViewCount)
            .ToList();

        var topPages = visits
            .GroupBy(v => v.NormalizedPath)
            .Select(g => new AnalyticsDailyPageBreakdown
            {
                LocalDate = reportDate,
                NormalizedPath = g.Key,
                PageViewCount = g.Count(),
            })
            .OrderByDescending(p => p.PageViewCount)
            .Take(TopPagesLimit)
            .ToList();

        await UpsertAggregatesAsync(reportDate, pageViewCount, uniqueVisitorCount, countryBreakdown, topPages, ct);

        try
        {
            var messageId = await SendReportEmailAsync(reportDate, pageViewCount, uniqueVisitorCount, countryBreakdown, topPages, ct);
            await RecordRunAsync(reportDate, AnalyticsReportStatus.Success, messageId, null, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send analytics report email for {ReportDate}", reportDate);
            await RecordRunAsync(reportDate, AnalyticsReportStatus.Failed, null, ex.Message, ct);
            throw;
        }

        await CleanupOldVisitsAsync(reportDate, ct);

        return new AnalyticsReportResult(AnalyticsReportOutcome.Sent, reportDate);
    }

    private async Task UpsertAggregatesAsync(
        DateOnly reportDate,
        int pageViewCount,
        int uniqueVisitorCount,
        List<AnalyticsDailyCountryBreakdown> countryBreakdown,
        List<AnalyticsDailyPageBreakdown> topPages,
        CancellationToken ct)
    {
        var existingSummary = await db.DailySummaries.FindAsync([reportDate], ct);
        if (existingSummary is null)
        {
            db.DailySummaries.Add(new AnalyticsDailySummary
            {
                LocalDate = reportDate,
                PageViewCount = pageViewCount,
                UniqueVisitorCount = uniqueVisitorCount,
            });
        }
        else
        {
            existingSummary.PageViewCount = pageViewCount;
            existingSummary.UniqueVisitorCount = uniqueVisitorCount;
        }

        var existingCountryRows = await db.DailyCountryBreakdowns
            .Where(c => c.LocalDate == reportDate)
            .ToListAsync(ct);
        db.DailyCountryBreakdowns.RemoveRange(existingCountryRows);
        db.DailyCountryBreakdowns.AddRange(countryBreakdown);

        var existingPageRows = await db.DailyPageBreakdowns
            .Where(p => p.LocalDate == reportDate)
            .ToListAsync(ct);
        db.DailyPageBreakdowns.RemoveRange(existingPageRows);
        db.DailyPageBreakdowns.AddRange(topPages);

        await db.SaveChangesAsync(ct);
    }

    private async Task RecordRunAsync(
        DateOnly reportDate,
        AnalyticsReportStatus status,
        string? resendMessageId,
        string? errorMessage,
        CancellationToken ct)
    {
        var run = await db.ReportRuns.FirstOrDefaultAsync(r => r.ReportDate == reportDate, ct);
        if (run is null)
        {
            run = new AnalyticsReportRun { ReportDate = reportDate };
            db.ReportRuns.Add(run);
        }

        run.Status = status;
        run.AttemptedAtUtc = DateTime.UtcNow;
        run.ResendMessageId = resendMessageId;
        run.ErrorMessage = errorMessage;

        await db.SaveChangesAsync(ct);
    }

    private async Task CleanupOldVisitsAsync(DateOnly reportDate, CancellationToken ct)
    {
        var cutoffOsloDate = reportDate.AddDays(-RetentionDays);
        var (cutoffUtc, _) = OsloClock.OsloDayRangeUtc(cutoffOsloDate);

        await db.Visits
            .Where(v => v.OccurredAtUtc < cutoffUtc)
            .ExecuteDeleteAsync(ct);
    }

    private async Task<string?> SendReportEmailAsync(
        DateOnly reportDate,
        int pageViewCount,
        int uniqueVisitorCount,
        List<AnalyticsDailyCountryBreakdown> countryBreakdown,
        List<AnalyticsDailyPageBreakdown> topPages,
        CancellationToken ct)
    {
        var html = BuildHtml(reportDate, pageViewCount, uniqueVisitorCount, countryBreakdown, topPages);
        var text = BuildText(reportDate, pageViewCount, uniqueVisitorCount, countryBreakdown, topPages);

        var payload = new
        {
            from = $"iamfara.com <{_resend.FromEmail}>",
            to = new[] { _analytics.ReportToEmail },
            subject = $"iamfara.com visitor report — {reportDate:yyyy-MM-dd}",
            html,
            text,
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails")
        {
            Content = JsonContent.Create(payload),
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _resend.ApiKey);

        using var response = await http.SendAsync(request, ct);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<ResendResponse>(cancellationToken: ct);
        return result?.Id;
    }

    private static string BuildHtml(
        DateOnly reportDate,
        int pageViewCount,
        int uniqueVisitorCount,
        List<AnalyticsDailyCountryBreakdown> countryBreakdown,
        List<AnalyticsDailyPageBreakdown> topPages)
    {
        var sb = new StringBuilder();
        sb.Append($"<h2>Visitor report for {reportDate:yyyy-MM-dd}</h2>");
        sb.Append($"<p>Page views: <strong>{pageViewCount}</strong><br>");
        sb.Append($"Approximate unique visitors: <strong>{uniqueVisitorCount}</strong></p>");

        if (pageViewCount == 0)
        {
            sb.Append("<p>No visits were recorded for this day.</p>");
        }
        else
        {
            sb.Append("<h3>Country breakdown</h3><table><tr><th align=\"left\">Country</th><th align=\"left\">Page views</th><th align=\"left\">Unique visitors</th></tr>");
            foreach (var c in countryBreakdown)
            {
                var label = c.CountryCode == "XX" ? "Unknown" : WebUtility.HtmlEncode(c.CountryCode);
                sb.Append($"<tr><td>{label}</td><td>{c.PageViewCount}</td><td>{c.UniqueVisitorCount}</td></tr>");
            }
            sb.Append("</table>");

            if (topPages.Count > 0)
            {
                sb.Append("<h3>Top pages</h3><table><tr><th align=\"left\">Path</th><th align=\"left\">Page views</th></tr>");
                foreach (var p in topPages)
                {
                    sb.Append($"<tr><td>{WebUtility.HtmlEncode(p.NormalizedPath)}</td><td>{p.PageViewCount}</td></tr>");
                }
                sb.Append("</table>");
            }

            if (countryBreakdown.TrueForAll(c => c.CountryCode == "XX"))
            {
                sb.Append("<p><em>Note: country could not be determined for any visit today.</em></p>");
            }
        }

        sb.Append(DbIpAttributionHtml);
        return sb.ToString();
    }

    // Required by DB-IP's CC BY 4.0 license for the Country Lite database used for
    // country lookups (see GeoIpService / docs/analytics.md).
    private const string DbIpAttributionHtml =
        "<p style=\"color:#888;font-size:12px\">IP geolocation by <a href=\"https://db-ip.com\">DB-IP</a>.</p>";

    private const string DbIpAttributionText = "IP geolocation by DB-IP (https://db-ip.com).";

    private static string BuildText(
        DateOnly reportDate,
        int pageViewCount,
        int uniqueVisitorCount,
        List<AnalyticsDailyCountryBreakdown> countryBreakdown,
        List<AnalyticsDailyPageBreakdown> topPages)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"Visitor report for {reportDate:yyyy-MM-dd}");
        sb.AppendLine($"Page views: {pageViewCount}");
        sb.AppendLine($"Approximate unique visitors: {uniqueVisitorCount}");

        if (pageViewCount == 0)
        {
            sb.AppendLine("No visits were recorded for this day.");
        }
        else
        {
            sb.AppendLine();
            sb.AppendLine("Country breakdown:");
            foreach (var c in countryBreakdown)
            {
                var label = c.CountryCode == "XX" ? "Unknown" : c.CountryCode;
                sb.AppendLine($"  {label}: {c.PageViewCount} views, {c.UniqueVisitorCount} unique");
            }

            if (topPages.Count > 0)
            {
                sb.AppendLine();
                sb.AppendLine("Top pages:");
                foreach (var p in topPages)
                {
                    sb.AppendLine($"  {p.NormalizedPath}: {p.PageViewCount} views");
                }
            }
        }

        sb.AppendLine();
        sb.AppendLine(DbIpAttributionText);
        return sb.ToString();
    }

    private record ResendResponse(string? Id);
}
