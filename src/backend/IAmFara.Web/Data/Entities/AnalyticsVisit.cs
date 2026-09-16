namespace IAmFara.Web.Data.Entities;

/// <summary>
/// One recorded page view. Short-lived: deleted by retention cleanup once its
/// day's aggregates have been computed. Never holds a raw IP address.
/// </summary>
public class AnalyticsVisit
{
    public long Id { get; set; }
    public DateTime OccurredAtUtc { get; set; }

    /// <summary>ISO 3166-1 alpha-2, or "XX" when it couldn't be determined.</summary>
    public string CountryCode { get; set; } = "XX";

    /// <summary>App-relative path only — no query string or fragment.</summary>
    public string NormalizedPath { get; set; } = "";

    /// <summary>Hex SHA-256 HMAC — rotates daily, never derived back to an IP.</summary>
    public string DailyVisitorKey { get; set; } = "";
}
