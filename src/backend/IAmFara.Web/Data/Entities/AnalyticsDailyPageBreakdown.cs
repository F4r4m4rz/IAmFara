namespace IAmFara.Web.Data.Entities;

/// <summary>Long-retention per-page daily totals ("top pages"), computed once by the report job.</summary>
public class AnalyticsDailyPageBreakdown
{
    public DateOnly LocalDate { get; set; }
    public string NormalizedPath { get; set; } = "";
    public int PageViewCount { get; set; }
}
