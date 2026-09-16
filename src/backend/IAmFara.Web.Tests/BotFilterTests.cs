using IAmFara.Web.Services;

namespace IAmFara.Web.Tests;

public class BotFilterTests
{
    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")]
    [InlineData("curl/8.4.0")]
    [InlineData("python-requests/2.31.0")]
    [InlineData("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0")]
    public void LooksLikeBot_DetectsKnownBotSignatures(string? userAgent)
    {
        Assert.True(BotFilter.LooksLikeBot(userAgent));
    }

    [Theory]
    [InlineData("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")]
    [InlineData("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")]
    [InlineData("Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0")]
    public void LooksLikeBot_AllowsRealBrowsers(string userAgent)
    {
        Assert.False(BotFilter.LooksLikeBot(userAgent));
    }
}
