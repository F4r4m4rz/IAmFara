using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace IAmFara.Web.Tests;

/// <summary>
/// HTTP-level authorization gating for the household/invitation endpoints —
/// the business rules themselves (atomic consume, last-Owner protection,
/// Owner-only creation) are covered at the service level in
/// HouseholdFacadeTests; this just confirms the endpoints are actually wired
/// behind the deny-by-default FallbackPolicy (and, for state-changing ones,
/// antiforgery validation) as intended.
/// </summary>
public class HouseholdEndpointTests : IClassFixture<AuthenticationTestFactory>
{
    private readonly AuthenticationTestFactory _factory;

    public HouseholdEndpointTests(AuthenticationTestFactory factory)
    {
        _factory = factory;
    }

    private HttpClient CreateClient() => _factory.CreateClient(new WebApplicationFactoryClientOptions
    {
        BaseAddress = new Uri("https://localhost"),
    });

    /// <summary>Sends a POST/DELETE as the given authenticated user, with a valid antiforgery token attached (required by every state-changing household endpoint).</summary>
    private static async Task<HttpResponseMessage> SendAuthenticatedAsync(HttpClient client, Guid userId, HttpMethod method, string path, object? body = null)
    {
        client.DefaultRequestHeaders.Remove(TestAuthHandler.UserIdHeader);
        client.DefaultRequestHeaders.Add(TestAuthHandler.UserIdHeader, userId.ToString());

        var tokenResponse = await client.GetAsync("/api/auth/csrf-token");
        var token = (await tokenResponse.Content.ReadFromJsonAsync<CsrfTokenResponse>())!.Token;
        var setCookie = tokenResponse.Headers.GetValues("Set-Cookie").First().Split(';')[0];

        using var request = new HttpRequestMessage(method, path);
        if (body is not null) request.Content = JsonContent.Create(body);
        request.Headers.Add("Cookie", setCookie);
        request.Headers.Add("X-CSRF-TOKEN", token);

        return await client.SendAsync(request);
    }

    private record CsrfTokenResponse(string Token);

    [Fact]
    public async Task CreateHousehold_WithoutAuthentication_ReturnsUnauthorized()
    {
        var client = CreateClient();

        var response = await client.PostAsJsonAsync("/api/households", new { name = "Test" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ConsumeInvitation_WithoutAuthentication_ReturnsUnauthorized()
    {
        var client = CreateClient();

        var response = await client.PostAsJsonAsync("/api/households/invitations/consume", new { token = "whatever" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateInvitation_WithoutAuthentication_ReturnsUnauthorized()
    {
        var client = CreateClient();

        var response = await client.PostAsJsonAsync($"/api/households/{Guid.NewGuid()}/invitations", new { email = "x@example.com", role = "member" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task RemoveMember_WithoutAuthentication_ReturnsUnauthorized()
    {
        var client = CreateClient();

        var response = await client.DeleteAsync($"/api/households/{Guid.NewGuid()}/members/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task RegisterNewUserBegin_WithoutAuthentication_IsAccessible()
    {
        var client = CreateClient();

        // Anonymous is allowed to reach the endpoint at all (no FallbackPolicy
        // block) — it still rejects a bogus token, just not with 401/403.
        var response = await client.PostAsJsonAsync("/api/auth/passkeys/register-new-user/begin", new { token = "not-real", displayName = "New User" });

        Assert.NotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.NotEqual(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateInvitation_ByANonOwner_ReturnsForbidden()
    {
        var userId = Guid.NewGuid();
        await _factory.SeedUserAsync(userId);
        var client = CreateClient();

        // This user has no membership at all in the given household.
        var response = await SendAuthenticatedAsync(client, userId, HttpMethod.Post,
            $"/api/households/{Guid.NewGuid()}/invitations", new { email = "invitee@example.com", role = "member" });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task CreateHousehold_WithAuthenticationAndAValidAntiforgeryToken_Succeeds()
    {
        var userId = Guid.NewGuid();
        await _factory.SeedUserAsync(userId);
        var client = CreateClient();

        var response = await SendAuthenticatedAsync(client, userId, HttpMethod.Post, "/api/households", new { name = "My Household" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
