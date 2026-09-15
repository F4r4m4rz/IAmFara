namespace IAmFara.Web.Options;

public class AnalyticsOptions
{
    /// <summary>Secret key for the daily-rotating visitor HMAC. Never log or expose this.</summary>
    public string VisitorHmacKey { get; set; } = "";

    /// <summary>Recipient for the daily report email.</summary>
    public string ReportToEmail { get; set; } = "";

    /// <summary>Bearer token required to trigger POST /api/analytics/report/run.</summary>
    public string ReportSecret { get; set; } = "";
}
