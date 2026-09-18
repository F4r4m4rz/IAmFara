using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace IAmFara.Web.Tests;

/// <summary>
/// Exercises the authentication foundation (deny-by-default FallbackPolicy,
/// AllowAnonymous exemptions, ICurrentUserAccessor, antiforgery validation)
/// against a real in-process TestServer, with the real cookie scheme swapped
/// for TestAuthHandler so tests don't depend on a real passkey ceremony.
/// </summary>
public class AuthenticationTestFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
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
        });
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
