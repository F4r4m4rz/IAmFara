namespace IAmFara.Data.Abstractions.Identity;

public interface IPasskeyCredentialRepository
{
    Task<PasskeyCredential?> GetByCredentialIdAsync(byte[] credentialId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PasskeyCredential>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task AddAsync(PasskeyCredential credential, CancellationToken cancellationToken = default);
    Task UpdateSignCountAsync(Guid id, uint newSignCount, CancellationToken cancellationToken = default);
    /// <summary>Does nothing if the credential doesn't exist or belongs to a different user.</summary>
    Task DeleteAsync(Guid userId, Guid id, CancellationToken cancellationToken = default);
}
