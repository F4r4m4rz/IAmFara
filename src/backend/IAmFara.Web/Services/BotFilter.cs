namespace IAmFara.Web.Services;

public static class BotFilter
{
    private static readonly string[] BotMarkers =
    [
        "bot", "spider", "crawl", "slurp", "curl", "wget", "python-requests",
        "headlesschrome", "phantomjs", "scrapy", "facebookexternalhit", "bingpreview",
        "go-http-client", "okhttp", "axios", "postmanruntime",
    ];

    /// <summary>
    /// Best-effort, not real bot detection: catches the obvious, common cases via
    /// User-Agent substrings. Most simple crawlers never call this endpoint at all
    /// (it's only triggered by JS execution in a real browser), which filters a lot
    /// of noise for free before this even runs.
    /// </summary>
    public static bool LooksLikeBot(string? userAgent)
    {
        if (string.IsNullOrWhiteSpace(userAgent)) return true; // real browsers always send one
        var lower = userAgent.ToLowerInvariant();
        return BotMarkers.Any(lower.Contains);
    }
}
