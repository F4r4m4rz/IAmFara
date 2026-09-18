using IAmFara.Data.Abstractions.Identity;

namespace IAmFara.Identity.Passkeys;

/// <summary>Listing/removing a user's own passkeys — separate from the registration ceremony itself.</summary>
public class PasskeyManagementService(IPasskeyCredentialRepository credentials)
{
    public Task<IReadOnlyList<PasskeyCredential>> ListAsync(Guid userId, CancellationToken cancellationToken = default) =>
        credentials.GetByUserIdAsync(userId, cancellationToken);

    /// <summary>
    /// Throws if this would remove the user's last passkey — a passkey is the
    /// only way to sign in (no password/invitation-based recovery exists), so
    /// leaving zero credentials would lock the account out permanently.
    /// </summary>
    public async Task RemoveAsync(Guid userId, Guid credentialId, CancellationToken cancellationToken = default)
    {
        var existing = await credentials.GetByUserIdAsync(userId, cancellationToken);
        if (existing.Count <= 1 && existing.Any(c => c.Id == credentialId))
        {
            throw new InvalidOperationException("Cannot remove your last passkey.");
        }

        await credentials.DeleteAsync(userId, credentialId, cancellationToken);
    }
}
