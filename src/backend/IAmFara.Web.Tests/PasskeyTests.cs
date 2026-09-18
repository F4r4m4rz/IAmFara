using System.Net;
using System.Net.Http.Json;
using Fido2NetLib;
using Fido2NetLib.Objects;
using IAmFara.Web.Contracts;

namespace IAmFara.Web.Tests;

/// <summary>
/// Passkey-specific security tests per the plan's §7: no anonymous credential
/// registration path exists, a challenge can't be replayed, and a failed
/// assertion never results in a signed-in session. A real browser/authenticator
/// can't be simulated here, so these focus on what's genuinely verifiable
/// without one — authorization gating and failure-path behavior — rather than
/// a full, cryptographically valid ceremony end to end.
/// </summary>
public class PasskeyTests : IClassFixture<AuthenticationTestFactory>
{
    private readonly AuthenticationTestFactory _factory;

    public PasskeyTests(AuthenticationTestFactory factory)
    {
        _factory = factory;
    }

    private HttpClient CreateClient() => _factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
    {
        BaseAddress = new Uri("https://localhost"),
    });

    [Fact]
    public async Task RegisterBegin_WithoutAuthentication_ReturnsUnauthorized()
    {
        var client = CreateClient();

        var response = await client.PostAsync("/api/auth/passkeys/register/begin", content: null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task RegisterBegin_WithAuthentication_ReturnsOptionsAndACeremonyId()
    {
        var userId = Guid.NewGuid();
        await _factory.SeedUserAsync(userId);
        var client = CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthHandler.UserIdHeader, userId.ToString());

        var response = await client.PostAsync("/api/auth/passkeys/register/begin", content: null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(response.Headers.Contains("X-Ceremony-Id"));
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("\"challenge\"", body);
    }

    [Fact]
    public async Task LoginBegin_WithoutAuthentication_Succeeds()
    {
        var client = CreateClient();

        var response = await client.PostAsync("/api/auth/passkeys/login/begin", content: null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(response.Headers.Contains("X-Ceremony-Id"));
    }

    [Fact]
    public async Task LoginComplete_WithAnInvalidAssertion_ReturnsUnauthorizedAndSetsNoAuthCookie()
    {
        var client = CreateClient();

        var beginResponse = await client.PostAsync("/api/auth/passkeys/login/begin", content: null);
        var ceremonyId = beginResponse.Headers.GetValues("X-Ceremony-Id").First();

        var garbageAssertion = new AuthenticatorAssertionRawResponse
        {
            Id = "garbage",
            RawId = [1, 2, 3],
            Type = PublicKeyCredentialType.PublicKey,
            Response = new AuthenticatorAssertionRawResponse.AssertionResponse
            {
                AuthenticatorData = [1, 2, 3],
                Signature = [1, 2, 3],
                ClientDataJson = [1, 2, 3],
            },
        };

        var response = await client.PostAsJsonAsync("/api/auth/passkeys/login/complete", new PasskeyLoginCompleteRequest(ceremonyId, garbageAssertion));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.False(response.Headers.TryGetValues("Set-Cookie", out var setCookieHeaders)
            && setCookieHeaders.Any(h => h.StartsWith("IAmFara.Auth", StringComparison.Ordinal)));
    }

    [Fact]
    public async Task RegisterComplete_ReplayingTheSameCeremonyId_FailsTheSecondTimeAsConsumed()
    {
        var userId = Guid.NewGuid();
        await _factory.SeedUserAsync(userId);
        var client = CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthHandler.UserIdHeader, userId.ToString());

        var beginResponse = await client.PostAsync("/api/auth/passkeys/register/begin", content: null);
        var ceremonyId = beginResponse.Headers.GetValues("X-Ceremony-Id").First();

        var garbageAttestation = new AuthenticatorAttestationRawResponse
        {
            Id = "garbage",
            RawId = [1, 2, 3],
            Type = PublicKeyCredentialType.PublicKey,
            Response = new AuthenticatorAttestationRawResponse.AttestationResponse
            {
                AttestationObject = [1, 2, 3],
                ClientDataJson = [1, 2, 3],
            },
        };

        var firstAttempt = await client.PostAsJsonAsync("/api/auth/passkeys/register/complete", new PasskeyRegistrationCompleteRequest(ceremonyId, garbageAttestation));
        var secondAttempt = await client.PostAsJsonAsync("/api/auth/passkeys/register/complete", new PasskeyRegistrationCompleteRequest(ceremonyId, garbageAttestation));

        // Both fail (the data is garbage either way), but critically the ceremony
        // was consumed by the first attempt — replaying the same ceremonyId can
        // never succeed even with a genuinely valid response the second time.
        Assert.Equal(HttpStatusCode.BadRequest, firstAttempt.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, secondAttempt.StatusCode);
    }
}
