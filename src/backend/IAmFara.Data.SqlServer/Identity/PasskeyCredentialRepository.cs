using IAmFara.Data.Abstractions.Identity;
using Microsoft.EntityFrameworkCore;

namespace IAmFara.Data.SqlServer.Identity;

public class PasskeyCredentialRepository(IdentityDbContext db) : IPasskeyCredentialRepository
{
    public Task<PasskeyCredential?> GetByCredentialIdAsync(byte[] credentialId, CancellationToken cancellationToken = default) =>
        db.PasskeyCredentials.FirstOrDefaultAsync(p => p.CredentialId == credentialId, cancellationToken);

    public async Task<IReadOnlyList<PasskeyCredential>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default) =>
        await db.PasskeyCredentials.Where(p => p.UserId == userId).ToListAsync(cancellationToken);

    public async Task AddAsync(PasskeyCredential credential, CancellationToken cancellationToken = default)
    {
        db.PasskeyCredentials.Add(credential);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateSignCountAsync(Guid id, uint newSignCount, CancellationToken cancellationToken = default)
    {
        await db.PasskeyCredentials
            .Where(p => p.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.SignCount, newSignCount), cancellationToken);
    }

    public async Task DeleteAsync(Guid userId, Guid id, CancellationToken cancellationToken = default)
    {
        await db.PasskeyCredentials
            .Where(p => p.Id == id && p.UserId == userId)
            .ExecuteDeleteAsync(cancellationToken);
    }
}
