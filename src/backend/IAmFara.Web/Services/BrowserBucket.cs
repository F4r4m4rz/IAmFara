namespace IAmFara.Web.Services;

/// <summary>
/// A coarse, low-entropy browser+OS bucket (e.g. "Chrome-Windows") derived from the
/// User-Agent — used only as an HMAC input, never stored. The full UA string is
/// intentionally never kept.
/// </summary>
public static class BrowserBucket
{
    public static string From(string? userAgent)
    {
        if (string.IsNullOrWhiteSpace(userAgent)) return "Unknown";

        var browser =
            userAgent.Contains("Edg/") ? "Edge" :
            userAgent.Contains("OPR/") || userAgent.Contains("Opera") ? "Opera" :
            userAgent.Contains("Firefox/") ? "Firefox" :
            userAgent.Contains("Chrome/") ? "Chrome" :
            userAgent.Contains("Safari/") ? "Safari" :
            "Other";

        var os =
            userAgent.Contains("Windows") ? "Windows" :
            userAgent.Contains("iPhone") || userAgent.Contains("iPad") ? "iOS" :
            userAgent.Contains("Mac OS X") ? "macOS" :
            userAgent.Contains("Android") ? "Android" :
            userAgent.Contains("Linux") ? "Linux" :
            "Other";

        return $"{browser}-{os}";
    }
}
