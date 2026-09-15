using System.Net;
using MaxMind.Db;
using Microsoft.Extensions.Logging;

namespace IAmFara.Web.Services;

/// <summary>
/// Looks up the ISO 3166-1 alpha-2 country code for an IP using the locally bundled
/// DB-IP Country Lite database (.mmdb format, wire-compatible with the MaxMind.Db
/// reader even though it isn't a MaxMind product). Fully offline — no per-request
/// network call, no cost, no rate limit. Any failure (missing file, corrupt entry,
/// unsupported IP) returns "XX" (Unknown) and never throws.
/// </summary>
public class GeoIpService : IDisposable
{
    private const string UnknownCountry = "XX";

    private readonly Reader? _reader;
    private readonly ILogger<GeoIpService> _logger;

    public GeoIpService(ILogger<GeoIpService> logger, IWebHostEnvironment env)
    {
        _logger = logger;
        var path = Path.Combine(env.ContentRootPath, "GeoIP", "dbip-country-lite.mmdb");

        try
        {
            _reader = new Reader(path);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to load GeoIP database; country lookups will return Unknown");
            _reader = null;
        }
    }

    public string Lookup(IPAddress? ip)
    {
        if (_reader is null || ip is null) return UnknownCountry;

        try
        {
            var data = _reader.Find<Dictionary<string, object>>(ip);
            if (data is null) return UnknownCountry;

            if (data.TryGetValue("country", out var countryObj) &&
                countryObj is Dictionary<string, object> country &&
                country.TryGetValue("iso_code", out var isoObj) &&
                isoObj is string isoCode &&
                isoCode.Length == 2)
            {
                return isoCode.ToUpperInvariant();
            }

            return UnknownCountry;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "GeoIP lookup failed; returning Unknown");
            return UnknownCountry;
        }
    }

    public void Dispose()
    {
        _reader?.Dispose();
    }
}
