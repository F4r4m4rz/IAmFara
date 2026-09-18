using Fido2NetLib;
using IAmFara.Data.Abstractions.Identity;
using Microsoft.Extensions.Caching.Memory;

namespace IAmFara.Identity.Passkeys;

/// <summary>
/// Verifies a passkey assertion (usernameless/discoverable-credential login).
/// Never signs anyone in itself — returns the authenticated user's id on
/// success and null on any failure, leaving HttpContext.SignInAsync to the
/// composition root, which is the only layer that should ever be able to
/// establish a session.
/// </summary>
public class PasskeyAuthenticationService(IFido2 fido2, IMemoryCache cache, IUserRepository users, IPasskeyCredentialRepository credentials)
{
    private static readonly TimeSpan ChallengeTtl = TimeSpan.FromMinutes(5);

    public (string CeremonyId, AssertionOptions Options) Begin()
    {
        var options = fido2.GetAssertionOptions(new GetAssertionOptionsParams
        {
            AllowedCredentials = [],
            UserVerification = Fido2NetLib.Objects.UserVerificationRequirement.Preferred,
        });

        var ceremonyId = Guid.NewGuid().ToString("N");
        cache.Set(CacheKey(ceremonyId), options, ChallengeTtl);
        return (ceremonyId, options);
    }

    public async Task<Guid?> CompleteAsync(string ceremonyId, AuthenticatorAssertionRawResponse assertionResponse, CancellationToken cancellationToken = default)
    {
        var key = CacheKey(ceremonyId);
        if (!cache.TryGetValue(key, out AssertionOptions? options) || options is null)
        {
            return null;
        }
        cache.Remove(key); // one-shot: consumed here whether or not the rest of this call succeeds.

        var credential = await credentials.GetByCredentialIdAsync(assertionResponse.RawId, cancellationToken);
        if (credential is null) return null;

        var user = await users.GetByIdAsync(credential.UserId, cancellationToken);
        if (user is null) return null;

        try
        {
            var result = await fido2.MakeAssertionAsync(new MakeAssertionParams
            {
                AssertionResponse = assertionResponse,
                OriginalOptions = options,
                StoredPublicKey = credential.PublicKey,
                StoredSignatureCounter = credential.SignCount,
                IsUserHandleOwnerOfCredentialIdCallback = (args, _) =>
                    Task.FromResult(args.UserHandle.SequenceEqual(user.Id.ToByteArray())),
            }, cancellationToken);

            await credentials.UpdateSignCountAsync(credential.Id, result.SignCount, cancellationToken);
            return user.Id;
        }
        catch (Fido2VerificationException)
        {
            return null;
        }
    }

    private static string CacheKey(string ceremonyId) => $"fido2:assert:{ceremonyId}";
}
