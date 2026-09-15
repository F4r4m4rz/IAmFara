using System.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging.Abstractions;
using IAmFara.Web.Services;

namespace IAmFara.Web.Tests;

public class GeoIpServiceTests
{
    private class FakeWebHostEnvironment : IWebHostEnvironment
    {
        public string ApplicationName { get; set; } = "Tests";
        public string EnvironmentName { get; set; } = "Test";
        public string WebRootPath { get; set; } = "";
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
        public string ContentRootPath { get; set; } = "";
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }

    [Fact]
    public void Lookup_ReturnsUnknown_WhenDatabaseFileIsMissing()
    {
        var env = new FakeWebHostEnvironment { ContentRootPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString()) };
        using var service = new GeoIpService(NullLogger<GeoIpService>.Instance, env);

        var result = service.Lookup(IPAddress.Parse("8.8.8.8"));

        Assert.Equal("XX", result);
    }

    [Fact]
    public void Lookup_ReturnsUnknown_ForNullIp()
    {
        var env = new FakeWebHostEnvironment { ContentRootPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString()) };
        using var service = new GeoIpService(NullLogger<GeoIpService>.Instance, env);

        var result = service.Lookup(null);

        Assert.Equal("XX", result);
    }
}
