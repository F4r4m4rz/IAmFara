using Fido2NetLib;
using Fido2NetLib.Objects;
using IAmFara.Data.Abstractions.Identity;
using Microsoft.Extensions.Caching.Memory;

namespace IAmFara.Identity.Passkeys;

/// <summary>
/// Registers a new passkey for an already-authorized user — the caller
/// (composition root) decides authorization (an authenticated session
/// adding another credential to their own account, or a valid invitation
/// activating a new one); this service has no anonymous "attach a credential
/// to any user" path of its own.
/// </summary>
public class PasskeyRegistrationService(IFido2 fido2, IMemoryCache cache, IUserRepository users, IPasskeyCredentialRepository credentials)
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

    private static string CacheKey(string ceremonyId) => $"fido2:reg:{ceremonyId}";
}
