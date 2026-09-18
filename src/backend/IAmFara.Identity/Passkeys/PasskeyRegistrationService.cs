using Fido2NetLib;
using Fido2NetLib.Objects;
using IAmFara.Data.Abstractions.Identity;
using IAmFara.Identity.Invitations;
using Microsoft.Extensions.Caching.Memory;

namespace IAmFara.Identity.Passkeys;

/// <summary>
/// Registers a new passkey for an already-authorized user — the caller
/// (composition root) decides authorization (an authenticated session
/// adding another credential to their own account, or a valid invitation
/// activating a new one); this service has no anonymous "attach a credential
/// to any user" path of its own.
/// </summary>
public class PasskeyRegistrationService(
    IFido2 fido2,
    IMemoryCache cache,
    IUserRepository users,
    IPasskeyCredentialRepository credentials,
    InvitationService invitationService)
{
    private static readonly TimeSpan ChallengeTtl = TimeSpan.FromMinutes(5);

    public async Task<(string CeremonyId, CredentialCreateOptions Options)> BeginAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await users.GetByIdAsync(userId, cancellationToken)
            ?? throw new InvalidOperationException("User not found.");
        var existingCredentials = await credentials.GetByUserIdAsync(userId, cancellationToken);

        var fido2User = new Fido2User
        {
            Id = user.Id.ToByteArray(),
            Name = user.Email,
            DisplayName = user.DisplayName,
        };

        var excludeCredentials = existingCredentials
            .Select(c => new PublicKeyCredentialDescriptor(c.CredentialId))
            .ToList();

        var options = fido2.RequestNewCredential(new RequestNewCredentialParams
        {
            User = fido2User,
            ExcludeCredentials = excludeCredentials,
            AuthenticatorSelection = AuthenticatorSelection.Default,
            AttestationPreference = AttestationConveyancePreference.None,
        });

        var ceremonyId = Guid.NewGuid().ToString("N");
        cache.Set(CacheKey(ceremonyId), (userId, options), ChallengeTtl);
        return (ceremonyId, options);
    }

    /// <summary>Throws on any validation failure — the caller translates that into an HTTP error, never a signed-in session.</summary>
    public async Task CompleteAsync(Guid userId, string ceremonyId, AuthenticatorAttestationRawResponse attestationResponse, CancellationToken cancellationToken = default)
    {
        var key = CacheKey(ceremonyId);
        if (!cache.TryGetValue(key, out (Guid UserId, CredentialCreateOptions Options)? entry) || entry is null)
        {
            throw new InvalidOperationException("Registration ceremony expired or not found.");
        }
        cache.Remove(key); // one-shot: consumed here whether or not the rest of this call succeeds.

        if (entry.Value.UserId != userId)
        {
            throw new InvalidOperationException("Registration ceremony belongs to a different user.");
        }

        var result = await fido2.MakeNewCredentialAsync(new MakeNewCredentialParams
        {
            AttestationResponse = attestationResponse,
            OriginalOptions = entry.Value.Options,
            IsCredentialIdUniqueToUserCallback = async (args, ct) =>
                await credentials.GetByCredentialIdAsync(args.CredentialId, ct) is null,
        }, cancellationToken);

        await credentials.AddAsync(new PasskeyCredential
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CredentialId = result.Id,
            PublicKey = result.PublicKey,
            SignCount = result.SignCount,
            CreatedAt = DateTimeOffset.UtcNow,
        }, cancellationToken);
    }

    /// <summary>
    /// Begins registration for a brand-new user, authorized by a valid
    /// identity invitation rather than an existing session — the only other
    /// way a passkey can be registered at all (see the class summary). No
    /// User row is created yet: that happens in CompleteForNewUserAsync,
    /// only once both the invitation and the attestation have themselves
    /// been validated, so a cancelled/failed ceremony never leaves behind an
    /// orphaned, credential-less account.
    /// </summary>
    public async Task<(string CeremonyId, CredentialCreateOptions Options)> BeginForNewUserAsync(string rawInvitationToken, string displayName, CancellationToken cancellationToken = default)
    {
        var invitation = await invitationService.ValidateAsync(rawInvitationToken, cancellationToken)
            ?? throw new InvalidOperationException("Invitation is invalid or expired.");

        var pendingUserId = Guid.NewGuid();
        var fido2User = new Fido2User
        {
            Id = pendingUserId.ToByteArray(),
            Name = invitation.Email,
            DisplayName = displayName,
        };

        var options = fido2.RequestNewCredential(new RequestNewCredentialParams
        {
            User = fido2User,
            ExcludeCredentials = [],
            AuthenticatorSelection = AuthenticatorSelection.Default,
            AttestationPreference = AttestationConveyancePreference.None,
        });

        var ceremonyId = Guid.NewGuid().ToString("N");
        cache.Set(CacheKey(ceremonyId), new NewUserCeremonyEntry(pendingUserId, invitation.Id, invitation.Email, displayName, options), ChallengeTtl);
        return (ceremonyId, options);
    }

    /// <summary>
    /// Throws on any failure (invalid attestation, or the invitation was
    /// consumed elsewhere in the meantime) — never creates a User. Returns the
    /// identity invitation's id alongside the new User so the composition root
    /// can check for a linked finance.HouseholdInvitations row (the "existing
    /// household, new user" flow) without needing to see the invitation itself.
    /// </summary>
    public async Task<(User User, Guid InvitationId)> CompleteForNewUserAsync(string ceremonyId, AuthenticatorAttestationRawResponse attestationResponse, CancellationToken cancellationToken = default)
    {
        var key = CacheKey(ceremonyId);
        if (!cache.TryGetValue(key, out NewUserCeremonyEntry? entry) || entry is null)
        {
            throw new InvalidOperationException("Registration ceremony expired or not found.");
        }
        cache.Remove(key); // one-shot: consumed here whether or not the rest of this call succeeds.

        var result = await fido2.MakeNewCredentialAsync(new MakeNewCredentialParams
        {
            AttestationResponse = attestationResponse,
            OriginalOptions = entry.Options,
            IsCredentialIdUniqueToUserCallback = async (args, ct) =>
                await credentials.GetByCredentialIdAsync(args.CredentialId, ct) is null,
        }, cancellationToken);

        // Only now, after the attestation has itself validated, is any
        // persisted state touched — and the invitation consume is the atomic
        // gate: if two concurrent completions raced this far, only one wins here.
        var consumed = await invitationService.TryConsumeAsync(entry.InvitationId, cancellationToken);
        if (!consumed)
        {
            throw new InvalidOperationException("Invitation is invalid or expired.");
        }

        var user = new User { Id = entry.UserId, DisplayName = entry.DisplayName, Email = entry.Email, CreatedAt = DateTimeOffset.UtcNow };
        await users.AddAsync(user, cancellationToken);

        await credentials.AddAsync(new PasskeyCredential
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            CredentialId = result.Id,
            PublicKey = result.PublicKey,
            SignCount = result.SignCount,
            CreatedAt = DateTimeOffset.UtcNow,
        }, cancellationToken);

        return (user, entry.InvitationId);
    }

    private record NewUserCeremonyEntry(Guid UserId, Guid InvitationId, string Email, string DisplayName, CredentialCreateOptions Options);

    private static string CacheKey(string ceremonyId) => $"fido2:reg:{ceremonyId}";
}
