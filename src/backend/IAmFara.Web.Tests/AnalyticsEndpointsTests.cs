using System.Net;
using System.Net.Http.Json;
using IAmFara.Web.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace IAmFara.Web.Tests;

/// <summary>
/// End-to-end tests for the analytics endpoints against an in-process TestServer,
/// with the real SQL Server DbContext swapped for a SQLite in-memory one so no real
/// database is needed to verify routing, auth, validation, and rate limiting.
/// </summary>
public class AnalyticsEndpointsFactory : WebApplicationFactory<Program>
{
    public const string ReportSecret = "test-report-secret-value";
    private readonly SqliteConnection _connection = new("DataSource=:memory:");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        _connection.Open();

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Analytics:VisitorHmacKey"] = "test-hmac-key",
                ["Analytics:ReportSecret"] = ReportSecret,
                ["Analytics:ReportToEmail"] = "me@iamfara.com",
                ["Resend:ApiKey"] = "test-key",
                ["Resend:FromEmail"] = "noreply@iamfara.com",
            });
        });

        builder.ConfigureServices(services =>
        {
            // Remove every descriptor AddDbContext<AnalyticsDbContext> registered for the app's
            // SqlServer configuration (EF Core composes same-context AddDbContext calls rather
            // than replacing, so removing only DbContextOptions<T> leaves both providers active
            // and isolated internal service providers don't help) before adding the SQLite one.
            var analyticsContextServiceTypes = services
                .Where(d => d.ServiceType.IsGenericType
                    && d.ServiceType.GetGenericArguments().Contains(typeof(AnalyticsDbContext)))
                .Select(d => d.ServiceType)
                .Distinct()
                .ToList();
            foreach (var serviceType in analyticsContextServiceTypes)
            {
                services.RemoveAll(serviceType);
            }
            services.AddDbContext<AnalyticsDbContext>(options => options.UseSqlite(_connection));

            var provider = services.BuildServiceProvider();
            using var scope = provider.CreateScope();
            scope.ServiceProvider.GetRequiredService<AnalyticsDbContext>().Database.EnsureCreated();
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) _connection.Dispose();
    }
}

public class AnalyticsEndpointsTests : IClassFixture<AnalyticsEndpointsFactory>
{
    private readonly AnalyticsEndpointsFactory _factory;

    public AnalyticsEndpointsTests(AnalyticsEndpointsFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task ReportRun_WithoutBearerToken_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsync("/api/analytics/report/run", null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ReportRun_WithWrongBearerToken_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "wrong-secret");

        var response = await client.PostAsync("/api/analytics/report/run", null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Visit_WithValidPath_RecordsOneRowAndReturnsOk()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.UserAgent.ParseAdd(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

        var response = await client.PostAsJsonAsync("/api/analytics/visit", new { path = "/a-unique-test-path" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AnalyticsDbContext>();
        Assert.True(await db.Visits.AnyAsync(v => v.NormalizedPath == "/a-unique-test-path"));
    }

    [Fact]
    public async Task Visit_WithInvalidPath_ReturnsOkButRecordsNoRow()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/analytics/visit", new { path = "not-a-valid-path" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AnalyticsDbContext>();
        Assert.False(await db.Visits.AnyAsync(v => v.NormalizedPath == "not-a-valid-path"));
    }

    [Fact]
    public async Task Visit_FromBotUserAgent_ReturnsOkButRecordsNoRow()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.UserAgent.ParseAdd("python-requests/2.31.0");

        var response = await client.PostAsJsonAsync("/api/analytics/visit", new { path = "/bot-test-path" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AnalyticsDbContext>();
        Assert.False(await db.Visits.AnyAsync(v => v.NormalizedPath == "/bot-test-path"));
    }

    [Fact]
    public async Task Visit_ExceedingRateLimit_Returns429()
    {
        // A fresh client/factory instance keeps this test's rate-limit window
        // isolated from the other tests in this fixture (they share partition
        // key "unknown" under TestServer, since it reports no RemoteIpAddress).
        await using var factory = new AnalyticsEndpointsFactory();
        var client = factory.CreateClient();

        HttpResponseMessage? last = null;
        for (var i = 0; i < 61; i++)
        {
            last = await client.PostAsJsonAsync("/api/analytics/visit", new { path = $"/rate-limit-test-{i}" });
        }

        Assert.Equal(HttpStatusCode.TooManyRequests, last!.StatusCode);
    }
}
