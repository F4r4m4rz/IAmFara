using Fido2NetLib;
using Fido2NetLib.Objects;
using IAmFara.Data.Abstractions.Identity;
using IAmFara.Data.SqlServer.Identity;
using IAmFara.Identity.Invitations;
using IAmFara.Identity.Passkeys;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace IAmFara.Web.Tests;

/// <summary>
/// Service-level test proving the challenge cache entry is consumed after one
/// use, precisely (not just "both attempts fail", which would also pass if the
/// same validation error simply happened twice) — the second CompleteAsync
/// call must fail with the specific "ceremony expired or not found" error,
/// never re-attempting Fido2 validation with a stale challenge.
/// </summary>
public class PasskeyRegistrationServiceTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly IdentityDbContext _db;
    private readonly PasskeyRegistrationService _registration;
    private readonly InvitationService _invitationService;

    public PasskeyRegistrationServiceTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
        var options = new DbContextOptionsBuilder<IdentityDbContext>().UseSqlite(_connection).Options;
        _db = new IdentityDbContext(options);
        _db.Database.EnsureCreated();

        var fido2 = new Fido2(new Fido2Configuration
        {
            ServerDomain = "localhost",
            ServerName = "Test",
            Origins = new HashSet<string> { "https://localhost" },
        });
        var cache = new MemoryCache(new MemoryCacheOptions());
        var users = new UserRepository(_db);
        var credentials = new PasskeyCredentialRepository(_db);
        _invitationService = new InvitationService(new InvitationRepository(_db));
        _registration = new PasskeyRegistrationService(fido2, cache, users, credentials, _invitationService);
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    private static AuthenticatorAttestationRawResponse GarbageAttestation() => new()
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

    [Fact]
    public async Task CompleteAsync_ReplayingTheSameCeremonyId_FailsWithCeremonyNotFound()
    {
        var user = new User { Id = Guid.NewGuid(), DisplayName = "Test", Email = "test@example.com", CreatedAt = DateTimeOffset.UtcNow };
        await new UserRepository(_db).AddAsync(user);

        var (ceremonyId, _) = await _registration.BeginAsync(user.Id);

        // First attempt: fails because the attestation data is garbage, but the
        // ceremony is consumed regardless of why it failed.
        await Assert.ThrowsAnyAsync<Exception>(() => _registration.CompleteAsync(user.Id, ceremonyId, GarbageAttestation()));

        // Second attempt with the same ceremonyId: must fail specifically because
        // the ceremony no longer exists, not from re-attempting Fido2 validation.
        var secondException = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _registration.CompleteAsync(user.Id, ceremonyId, GarbageAttestation()));
        Assert.Contains("expired or not found", secondException.Message);
    }

    [Fact]
    public async Task BeginForNewUserAsync_WithAnUnknownToken_Throws()
    {
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _registration.BeginForNewUserAsync("not-a-real-token", "New User"));
    }

    [Fact]
    public async Task BeginForNewUserAsync_WithAnExpiredInvitation_Throws()
    {
        var (invitation, rawToken) = await _invitationService.CreateAsync("new-user@example.com", null);
        await _db.Invitations
            .Where(i => i.Id == invitation.Id)
            .ExecuteUpdateAsync(s => s.SetProperty(i => i.ExpiresAt, DateTimeOffset.UtcNow.AddDays(-1)));
        _db.ChangeTracker.Clear();

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _registration.BeginForNewUserAsync(rawToken, "New User"));
    }

    [Fact]
    public async Task CompleteForNewUserAsync_ReplayingTheSameCeremonyId_FailsWithCeremonyNotFound()
    {
        var (_, rawToken) = await _invitationService.CreateAsync("new-user@example.com", null);
        var (ceremonyId, _) = await _registration.BeginForNewUserAsync(rawToken, "New User");

        await Assert.ThrowsAnyAsync<Exception>(() => _registration.CompleteForNewUserAsync(ceremonyId, GarbageAttestation()));

        var secondException = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _registration.CompleteForNewUserAsync(ceremonyId, GarbageAttestation()));
        Assert.Contains("expired or not found", secondException.Message);
    }

    [Fact]
    public async Task CompleteForNewUserAsync_WithAFailedAttestation_LeavesTheInvitationUnconsumed()
    {
        var (_, rawToken) = await _invitationService.CreateAsync("new-user@example.com", null);
        var (ceremonyId, _) = await _registration.BeginForNewUserAsync(rawToken, "New User");

        await Assert.ThrowsAnyAsync<Exception>(() => _registration.CompleteForNewUserAsync(ceremonyId, GarbageAttestation()));

        // A failed ceremony must not burn the invitation — the user can retry
        // with a fresh ceremony using the same link rather than needing a new one.
        var stillValid = await _invitationService.ValidateAsync(rawToken);
        Assert.NotNull(stillValid);
    }
}
