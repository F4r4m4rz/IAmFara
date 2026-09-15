namespace IAmFara.Web.Data.Entities;

public enum AnalyticsReportStatus
{
    Success,
    Failed,
}

/// <summary>
/// Idempotency marker: one row per reporting date. The report endpoint checks this
/// first so retries (GitHub Actions re-runs, manual re-triggers) never double-send.
/// </summary>
public class AnalyticsReportRun
{
    public DateOnly ReportDate { get; set; }
    public AnalyticsReportStatus Status { get; set; }
    public DateTime AttemptedAtUtc { get; set; }
    public string? ResendMessageId { get; set; }
    public string? ErrorMessage { get; set; }
}
