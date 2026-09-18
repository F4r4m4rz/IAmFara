using System.Net;
using System.Net.Http.Json;
using IAmFara.Data.Abstractions.Identity;
using IAmFara.Data.SqlServer.Finance;
using IAmFara.Data.SqlServer.Identity;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace IAmFara.Web.Tests;

/// <summary>
/// Exercises the authentication foundation (deny-by-default FallbackPolicy,
/// AllowAnonymous exemptions, ICurrentUserAccessor, antiforgery validation)
/// against a real in-process TestServer, with the real cookie scheme swapped
/// for TestAuthHandler so tests don't depend on a real passkey ceremony, and
/// IdentityDbContext/FinanceDbContext swapped to SQLite so endpoints that
/// touch Identity or Finance data don't need a real SQL Server.
/// </summary>
public class AuthenticationTestFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _identityConnection = new("DataSource=:memory:");
    private readonly SqliteConnection _financeConnection = new("DataSource=:memory:");

    /// <summary>Seeds a User row matching a TestAuthHandler-authenticated id, for endpoints that look the current user up.</summary>
    public async Task SeedUserAsync(Guid userId, string email = "test@example.com")
    {
        using var scope = Services.CreateScope();
        var users = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        await users.AddAsync(new User { Id = userId, DisplayName = "Test User", Email = email, CreatedAt = DateTimeOffset.UtcNow });
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        _identityConnection.Open();
        _financeConnection.Open();

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Analytics:VisitorHmacKey"] = "test-hmac-key",
                ["Analytics:ReportSecret"] = "test-report-secret-value",
                ["Analytics:ReportToEmail"] = "me@iamfara.com",
                ["Resend:ApiKey"] = "test-key",
                ["Resend:FromEmail"] = "noreply@iamfara.com",
            });
        });

        builder.ConfigureServices(services =>
        {
            services.AddAuthentication(TestAuthHandler.SchemeName)
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.SchemeName, _ => { });

            SwapToSqlite<IdentityDbContext>(services, _identityConnection);
            SwapToSqlite<FinanceDbContext>(services, _financeConnection);

            var provider = services.BuildServiceProvider();
            using var scope = provider.CreateScope();
            scope.ServiceProvider.GetRequiredService<IdentityDbContext>().Database.EnsureCreated();
            scope.ServiceProvider.GetRequiredService<FinanceDbContext>().Database.EnsureCreated();
        });
    }

    // Same "remove every descriptor closing over the context type" approach as
    // AnalyticsEndpointsTests — RemoveAll<DbContextOptions<T>> alone no longer
    // isolates a swapped-in provider from the app's own SqlServer registration
    // (EF Core composes same-context AddDbContext calls rather than replacing
    // them).
    private static void SwapToSqlite<TContext>(IServiceCollection services, SqliteConnection connection) where TContext : DbContext
    {
        var contextServiceTypes = services
            .Where(d => d.ServiceType.IsGenericType && d.ServiceType.GetGenericArguments().Contains(typeof(TContext)))
            .Select(d => d.ServiceType)
            .Distinct()
            .ToList();
        foreach (var serviceType in contextServiceTypes)
        {
            services.RemoveAll(serviceType);
        }
        services.AddDbContext<TContext>(options => options.UseSqlite(connection));
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing)
        {
            _identityConnection.Dispose();
            _financeConnection.Dispose();
        }
    }
}

public class AuthenticationTests : IClassFixture<AuthenticationTestFactory>
{
    private readonly AuthenticationTestFactory _factory;

    public AuthenticationTests(AuthenticationTestFactory factory)
    {
        _factory = factory;
    }

    // The antiforgery cookie is Secure-only, and Request.IsHttps must be true
    // for the cookie/auth middleware to treat the request as such — the
    // default TestServer base address is http://localhost, so an https one
    // is used here instead (a real, unbound host — no request ever leaves TestServer).
    private HttpClient CreateClient() => _factory.CreateClient(new WebApplicationFactoryClientOptions
    {
        BaseAddress = new Uri("https://localhost"),
    });

    [Fact]
    public async Task Me_WithoutAuthentication_ReturnsUnauthorized()
    {
        var client = CreateClient();

        var response = await client.GetAsync("/api/auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Me_WithAuthentication_ReturnsTheAuthenticatedUserId()
    {
        var client = CreateClient();
        var userId = Guid.NewGuid();
        client.DefaultRequestHeaders.Add(TestAuthHandler.UserIdHeader, userId.ToString());

        var response = await client.GetAsync("/api/auth/me");
        var body = await response.Content.ReadFromJsonAsync<MeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(userId, body!.UserId);
    }

    [Fact]
    public async Task Contact_RemainsAnonymouslyAccessibleUnderTheFallbackPolicy()
    {
        var client = CreateClient();

        // No auth header, no antiforgery token — this endpoint predates cookie
        // auth entirely and must stay reachable by anonymous visitors.
        var response = await client.PostAsJsonAsync("/api/contact", new
        {
            name = "Test",
            email = "test@example.com",
            message = "Hello, this is a long enough message for validation.",
        });

        Assert.NotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.NotEqual(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task SignOut_WithoutAntiforgeryToken_ReturnsBadRequest()
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthHandler.UserIdHeader, Guid.NewGuid().ToString());

        var response = await client.PostAsync("/api/auth/sign-out", content: null);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task SignOut_WithAValidAntiforgeryToken_Succeeds()
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthHandler.UserIdHeader, Guid.NewGuid().ToString());

        var tokenResponse = await client.GetAsync("/api/auth/csrf-token");
        var tokenBody = await tokenResponse.Content.ReadFromJsonAsync<CsrfTokenResponse>();
        // GetAndStoreTokens' cookie half is attached to the response via
        // Set-Cookie; HttpClient doesn't persist cookies across requests on
        // its own unless it shares a CookieContainer/handler, so build one here.
        var setCookie = tokenResponse.Headers.TryGetValues("Set-Cookie", out var cookies)
            ? cookies.First().Split(';')[0]
            : throw new InvalidOperationException("Antiforgery cookie was not set.");

        // The X-Test-UserId header is already on the client's DefaultRequestHeaders
        // and flows through automatically — only the antiforgery cookie/header
        // need adding per-request.
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/sign-out");
        request.Headers.Add("Cookie", setCookie);
        request.Headers.Add("X-CSRF-TOKEN", tokenBody!.Token);

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    private record MeResponse(Guid? UserId);
    private record CsrfTokenResponse(string Token);
}
