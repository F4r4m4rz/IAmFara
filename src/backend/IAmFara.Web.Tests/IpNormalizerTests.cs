using System.Net;
using IAmFara.Web.Services;

namespace IAmFara.Web.Tests;

public class IpNormalizerTests
{
    [Theory]
    [InlineData("203.0.113.42", "203.0.113.0")]
    [InlineData("203.0.113.255", "203.0.113.0")]
    [InlineData("10.1.2.3", "10.1.2.0")]
    public void Normalize_TruncatesIPv4ToSlash24(string input, string expected)
    {
        var result = IpNormalizer.Normalize(IPAddress.Parse(input));
        Assert.Equal(expected, result);
    }

    [Fact]
    public void Normalize_TruncatesIPv6ToSlash64()
    {
        var result = IpNormalizer.Normalize(IPAddress.Parse("2001:db8:abcd:1234:5678:9abc:def0:1234"));
        Assert.Equal("2001:db8:abcd:1234::", result);
    }
}
