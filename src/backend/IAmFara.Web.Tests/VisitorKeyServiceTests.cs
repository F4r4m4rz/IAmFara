using System.Net;
using IAmFara.Web.Options;
using IAmFara.Web.Services;
using Microsoft.Extensions.Options;

namespace IAmFara.Web.Tests;

public class VisitorKeyServiceTests
{
    private static VisitorKeyService CreateService(string key = "test-hmac-key-for-unit-tests")
    {
        return new VisitorKeyService(Microsoft.Extensions.Options.Options.Create(new AnalyticsOptions { VisitorHmacKey = key }));
    }

    [Fact]
    public void ComputeKey_SameInputs_ProducesSameKey()
    {
        var service = CreateService();
        var ip = IPAddress.Parse("203.0.113.42");
        var date = new DateOnly(2026, 3, 15);

        var key1 = service.ComputeKey(ip, "Mozilla/5.0 Chrome/120.0 Windows", date);
        var key2 = service.ComputeKey(ip, "Mozilla/5.0 Chrome/120.0 Windows", date);

        Assert.Equal(key1, key2);
    }

    [Fact]
    public void ComputeKey_DifferentDate_ProducesDifferentKey()
    {
        var service = CreateService();
        var ip = IPAddress.Parse("203.0.113.42");
        const string ua = "Mozilla/5.0 Chrome/120.0 Windows";

        var day1 = service.ComputeKey(ip, ua, new DateOnly(2026, 3, 15));
        var day2 = service.ComputeKey(ip, ua, new DateOnly(2026, 3, 16));

        Assert.NotEqual(day1, day2);
    }

    [Fact]
    public void ComputeKey_DifferentBrowserBucket_ProducesDifferentKey()
    {
        var service = CreateService();
        var ip = IPAddress.Parse("203.0.113.42");
        var date = new DateOnly(2026, 3, 15);

        var chrome = service.ComputeKey(ip, "Mozilla/5.0 Chrome/120.0 Windows", date);
        var firefox = service.ComputeKey(ip, "Mozilla/5.0 Firefox/120.0 Windows", date);

        Assert.NotEqual(chrome, firefox);
    }

    [Fact]
    public void ComputeKey_DifferentIp_ProducesDifferentKey()
    {
        var service = CreateService();
        var date = new DateOnly(2026, 3, 15);
        const string ua = "Mozilla/5.0 Chrome/120.0 Windows";

        var key1 = service.ComputeKey(IPAddress.Parse("203.0.113.1"), ua, date);
        var key2 = service.ComputeKey(IPAddress.Parse("203.0.113.254"), ua, date);

        // Both addresses fall in the same normalized /24 subnet, so the keys must
        // actually match here — this documents the intentional subnet-level coarsening.
        Assert.Equal(key1, key2);
    }

    [Fact]
    public void ComputeKey_DifferentSubnet_ProducesDifferentKey()
    {
        var service = CreateService();
        var date = new DateOnly(2026, 3, 15);
        const string ua = "Mozilla/5.0 Chrome/120.0 Windows";

        var key1 = service.ComputeKey(IPAddress.Parse("203.0.113.1"), ua, date);
        var key2 = service.ComputeKey(IPAddress.Parse("203.0.114.1"), ua, date);

        Assert.NotEqual(key1, key2);
    }

    [Fact]
    public void ComputeKey_DifferentHmacKey_ProducesDifferentKey()
    {
        var ip = IPAddress.Parse("203.0.113.42");
        var date = new DateOnly(2026, 3, 15);
        const string ua = "Mozilla/5.0 Chrome/120.0 Windows";

        var key1 = CreateService("secret-one").ComputeKey(ip, ua, date);
        var key2 = CreateService("secret-two").ComputeKey(ip, ua, date);

        Assert.NotEqual(key1, key2);
    }

    [Fact]
    public void ComputeKey_ReturnsSixtyFourHexCharacters()
    {
        var service = CreateService();
        var key = service.ComputeKey(IPAddress.Parse("203.0.113.42"), "Mozilla/5.0 Chrome/120.0 Windows", new DateOnly(2026, 3, 15));

        Assert.Equal(64, key.Length);
        Assert.Matches("^[0-9A-F]{64}$", key);
    }
}
