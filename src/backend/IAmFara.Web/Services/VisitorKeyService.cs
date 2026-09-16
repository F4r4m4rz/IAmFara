using System.Net;
using System.Security.Cryptography;
using System.Text;
using IAmFara.Web.Options;
using Microsoft.Extensions.Options;

namespace IAmFara.Web.Services;

/// <summary>
/// Computes the daily-rotating, non-reversible "approximate visitor" identity used
/// only for counting distinct visitors per day. It is never derivable back to an IP
/// address: the raw IP is truncated (see IpNormalizer), combined with a coarse
/// browser bucket and the Oslo-local calendar date, then run through a keyed HMAC.
/// The date component alone guarantees a full rotation every calendar day.
/// </summary>
public class VisitorKeyService(IOptions<AnalyticsOptions> options)
{
    public string ComputeKey(IPAddress? ip, string? userAgent, DateOnly localDate)
    {
        var normalizedIp = ip is null ? "unknown" : IpNormalizer.Normalize(ip);
        var browserBucket = BrowserBucket.From(userAgent);
        var input = $"{normalizedIp}|{browserBucket}|{localDate:yyyy-MM-dd}";

        var key = Encoding.UTF8.GetBytes(options.Value.VisitorHmacKey);
        using var hmac = new HMACSHA256(key);
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(hash); // 64 hex chars, uppercase
    }
}
