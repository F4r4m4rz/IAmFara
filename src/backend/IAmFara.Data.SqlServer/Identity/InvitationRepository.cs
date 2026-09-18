using IAmFara.Data.Abstractions.Identity;
using Microsoft.EntityFrameworkCore;

namespace IAmFara.Data.SqlServer.Identity;

public class InvitationRepository(IdentityDbContext db) : IInvitationRepository
{
    public Task<Invitation?> GetByTokenHashAsync(byte[] tokenHash, CancellationToken cancellationToken = default) =>
        db.Invitations.FirstOrDefaultAsync(i => i.TokenHash == tokenHash, cancellationToken);

    public async Task AddAsync(Invitation invitation, CancellationToken cancellationToken = default)
    {
        db.Invitations.Add(invitation);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> TryConsumeAsync(Guid id, DateTimeOffset usedAt, CancellationToken cancellationToken = default)
    {
        var rowsChanged = await db.Invitations
            .Where(i => i.Id == id && i.UsedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(i => i.UsedAt, usedAt), cancellationToken);
        return rowsChanged == 1;
    }
}
