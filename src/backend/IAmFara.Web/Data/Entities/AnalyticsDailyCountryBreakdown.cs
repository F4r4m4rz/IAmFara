namespace IAmFara.Web.Data.Entities;

/// <summary>Long-retention per-country daily totals, computed once by the report job.</summary>
public class AnalyticsDailyCountryBreakdown
{
    public DateOnly LocalDate { get; set; }
    public string CountryCode { get; set; } = "XX";
    public int PageViewCount { get; set; }
    public int UniqueVisitorCount { get; set; }
}
