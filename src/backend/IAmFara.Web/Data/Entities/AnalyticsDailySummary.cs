namespace IAmFara.Web.Data.Entities;

/// <summary>Long-retention daily totals, computed once by the report job.</summary>
public class AnalyticsDailySummary
{
    public DateOnly LocalDate { get; set; }
    public int PageViewCount { get; set; }
    public int UniqueVisitorCount { get; set; }
}
