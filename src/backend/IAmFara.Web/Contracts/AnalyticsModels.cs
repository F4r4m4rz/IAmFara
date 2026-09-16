namespace IAmFara.Web.Contracts;

/// <summary>Body sent by the frontend beacon on every page view (first load + each route change).</summary>
public record AnalyticsVisitRequest(string? Path);

/// <summary>Response for POST /api/analytics/report/run.</summary>
public record AnalyticsReportRunResult(string Status, string ReportDate);
