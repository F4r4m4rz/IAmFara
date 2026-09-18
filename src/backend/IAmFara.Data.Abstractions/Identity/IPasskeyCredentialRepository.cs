namespace IAmFara.Data.Abstractions.Identity;

public interface IPasskeyCredentialRepository
{
    Task<PasskeyCredential?> GetByCredentialIdAsync(byte[] credentialId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PasskeyCredential>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task AddAsync(PasskeyCredential credential, CancellationToken cancellationToken = default);
    Task UpdateSignCountAsync(Guid id, uint newSignCount, CancellationToken cancellationToken = default);
}
