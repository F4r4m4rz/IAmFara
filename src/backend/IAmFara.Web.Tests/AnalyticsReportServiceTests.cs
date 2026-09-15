using System.Net;
using System.Net.Http;
using System.Text.Json;
using IAmFara.Web.Data;
using IAmFara.Web.Data.Entities;
using IAmFara.Web.Options;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using IAmFara.Web.Services;

namespace IAmFara.Web.Tests;

public class AnalyticsReportServiceTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly AnalyticsDbContext _db;

    public AnalyticsReportServiceTests()
    {
        // A shared, open SQLite in-memory connection: EF's SQLite provider closes
        // the underlying DB when the connection closes, so the connection is kept
        // open for the lifetime of each test to preserve the schema and data.
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<AnalyticsDbContext>()
            .UseSqlite(_connection)
            .Options;

        _db = new AnalyticsDbContext(options);
        _db.Database.EnsureCreated();
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    private static AnalyticsReportService CreateService(AnalyticsDbContext db, HttpMessageHandler handler)
    {
        var resendOptions = Microsoft.Extensions.Options.Options.Create(new ResendOptions
        {
            ApiKey = "test-key",
            FromEmail = "noreply@iamfara.com",
        });
        var analyticsOptions = Microsoft.Extensions.Options.Options.Create(new AnalyticsOptions
        {
            VisitorHmacKey = "test-hmac-key",
            ReportToEmail = "me@iamfara.com",
            ReportSecret = "test-secret",
        });

        var httpClient = new HttpClient(handler);
        return new AnalyticsReportService(db, httpClient, resendOptions, analyticsOptions, NullLogger<AnalyticsReportService>.Instance);
    }

    private class StubHandler(HttpStatusCode statusCode, string responseBody) : HttpMessageHandler
    {
        public string? LastRequestBody { get; private set; }
        public int CallCount { get; private set; }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            // The caller disposes the request (and its content) right after
            // awaiting SendAsync, so the body must be captured now rather than
            // read back from the request object afterward.
            LastRequestBody = request.Content is null ? null : await request.Content.ReadAsStringAsync(cancellationToken);
            CallCount++;
            return new HttpResponseMessage(statusCode)
            {
                Content = new StringContent(responseBody, System.Text.Encoding.UTF8, "application/json"),
            };
        }
    }

    private static void AddVisit(AnalyticsDbContext db, DateTime occurredAtUtc, string countryCode, string path, string visitorKey)
    {
        db.Visits.Add(new AnalyticsVisit
        {
            OccurredAtUtc = occurredAtUtc,
            CountryCode = countryCode,
            NormalizedPath = path,
            DailyVisitorKey = visitorKey,
        });
    }

    [Fact]
    public async Task RunForDateAsync_ComputesCorrectAggregates()
    {
        var reportDate = new DateOnly(2026, 1, 15);
        var (startUtc, _) = OsloClock.OsloDayRangeUtc(reportDate);

        AddVisit(_db, startUtc.AddHours(1), "NO", "/", "visitor-a");
        AddVisit(_db, startUtc.AddHours(2), "NO", "/projects", "visitor-a");
        AddVisit(_db, startUtc.AddHours(3), "NO", "/", "visitor-b");
        AddVisit(_db, startUtc.AddHours(4), "US", "/contact", "visitor-c");
        AddVisit(_db, startUtc.AddHours(5), "XX", "/", "visitor-d");
        await _db.SaveChangesAsync();

        var handler = new StubHandler(HttpStatusCode.OK, """{"id":"resend-message-id"}""");
        var service = CreateService(_db, handler);

        var result = await service.RunForDateAsync(reportDate, CancellationToken.None);

        Assert.Equal(AnalyticsReportOutcome.Sent, result.Outcome);

        var summary = await _db.DailySummaries.SingleAsync(s => s.LocalDate == reportDate);
        Assert.Equal(5, summary.PageViewCount);
        Assert.Equal(4, summary.UniqueVisitorCount);

        var countryRows = await _db.DailyCountryBreakdowns.Where(c => c.LocalDate == reportDate).ToListAsync();
        Assert.Equal(3, countryRows.Count);
        Assert.Equal(3, countryRows.Single(c => c.CountryCode == "NO").PageViewCount);
        Assert.Equal(2, countryRows.Single(c => c.CountryCode == "NO").UniqueVisitorCount);
        Assert.Equal(1, countryRows.Single(c => c.CountryCode == "XX").PageViewCount);

        var pageRows = await _db.DailyPageBreakdowns.Where(p => p.LocalDate == reportDate).ToListAsync();
        Assert.Equal(3, pageRows.Single(p => p.NormalizedPath == "/").PageViewCount);
        Assert.Equal(1, pageRows.Single(p => p.NormalizedPath == "/projects").PageViewCount);
        Assert.Equal(1, pageRows.Single(p => p.NormalizedPath == "/contact").PageViewCount);

        Assert.Equal(1, handler.CallCount);
        using var json = JsonDocument.Parse(handler.LastRequestBody!);
        Assert.Contains("visitor report", json.RootElement.GetProperty("subject").GetString());
    }

    [Fact]
    public async Task RunForDateAsync_EmptyDay_StillSendsReportWithNoVisitsNote()
    {
        var reportDate = new DateOnly(2026, 2, 1);
        var handler = new StubHandler(HttpStatusCode.OK, """{"id":"resend-message-id"}""");
        var service = CreateService(_db, handler);

        var result = await service.RunForDateAsync(reportDate, CancellationToken.None);

        Assert.Equal(AnalyticsReportOutcome.Sent, result.Outcome);

        var summary = await _db.DailySummaries.SingleAsync(s => s.LocalDate == reportDate);
        Assert.Equal(0, summary.PageViewCount);
        Assert.Equal(0, summary.UniqueVisitorCount);

        Assert.Contains("No visits were recorded", handler.LastRequestBody);
    }

    [Fact]
    public async Task RunForDateAsync_SecondCallForSameDate_IsIdempotentAndDoesNotResend()
    {
        var reportDate = new DateOnly(2026, 2, 2);
        var handler = new StubHandler(HttpStatusCode.OK, """{"id":"resend-message-id"}""");
        var service = CreateService(_db, handler);

        var first = await service.RunForDateAsync(reportDate, CancellationToken.None);
        var second = await service.RunForDateAsync(reportDate, CancellationToken.None);

        Assert.Equal(AnalyticsReportOutcome.Sent, first.Outcome);
        Assert.Equal(AnalyticsReportOutcome.AlreadySent, second.Outcome);
        Assert.Equal(1, handler.CallCount);
    }

    [Fact]
    public async Task RunForDateAsync_NotConfigured_ReturnsNotConfiguredAndSendsNoEmail()
    {
        var reportDate = new DateOnly(2026, 2, 3);
        var handler = new StubHandler(HttpStatusCode.OK, """{"id":"resend-message-id"}""");

        var resendOptions = Microsoft.Extensions.Options.Options.Create(new ResendOptions { ApiKey = "", FromEmail = "" });
        var analyticsOptions = Microsoft.Extensions.Options.Options.Create(new AnalyticsOptions());
        var service = new AnalyticsReportService(_db, new HttpClient(handler), resendOptions, analyticsOptions, NullLogger<AnalyticsReportService>.Instance);

        var result = await service.RunForDateAsync(reportDate, CancellationToken.None);

        Assert.Equal(AnalyticsReportOutcome.NotConfigured, result.Outcome);
        Assert.Equal(0, handler.CallCount);
    }

    [Fact]
    public async Task RunForDateAsync_CleansUpVisitsOlderThanRetentionWindow()
    {
        var reportDate = new DateOnly(2026, 3, 1);
        var (startUtc, _) = OsloClock.OsloDayRangeUtc(reportDate);

        // Well within retention (30 days).
        AddVisit(_db, startUtc.AddHours(1), "NO", "/", "recent-visitor");
        // Older than the 30-day retention window relative to reportDate.
        var oldDate = new DateOnly(2026, 1, 1);
        var (oldStartUtc, _) = OsloClock.OsloDayRangeUtc(oldDate);
        AddVisit(_db, oldStartUtc.AddHours(1), "NO", "/", "old-visitor");
        await _db.SaveChangesAsync();

        var handler = new StubHandler(HttpStatusCode.OK, """{"id":"resend-message-id"}""");
        var service = CreateService(_db, handler);

        await service.RunForDateAsync(reportDate, CancellationToken.None);

        var remaining = await _db.Visits.ToListAsync();
        Assert.Single(remaining);
        Assert.Equal("recent-visitor", remaining[0].DailyVisitorKey);
    }
}
