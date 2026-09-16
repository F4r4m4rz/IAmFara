using IAmFara.Web.Services;

namespace IAmFara.Web.Tests;

public class BrowserBucketTests
{
    [Theory]
    [InlineData("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", "Chrome-Windows")]
    [InlineData("Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0", "Firefox-Linux")]
    [InlineData("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1", "Safari-iOS")]
    [InlineData(null, "Unknown")]
    [InlineData("", "Unknown")]
    public void From_ProducesExpectedBucket(string? userAgent, string expected)
    {
        Assert.Equal(expected, BrowserBucket.From(userAgent));
    }
}
