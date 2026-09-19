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
        // ExpiresAt must be part of the same atomic condition as UsedAt — a
        // separate non-atomic expiry check earlier (e.g. at ceremony begin)
        // leaves a window where a long-running ceremony could still consume
        // an invitation that expired in the meantime. Uses
        // DateTimeOffset.Compare(...), not a plain >= on the two
        // DateTimeOffset values — EF Core's SQLite provider (used by this
        // app's unit tests, not production) can't translate a direct
        // comparison operator on DateTimeOffset inside ExecuteUpdateAsync
        // specifically (verified empirically); both providers translate the
        // Compare() form without issue.
        var rowsChanged = await db.Invitations
            .Where(i => i.Id == id && i.UsedAt == null && DateTimeOffset.Compare(i.ExpiresAt, usedAt) >= 0)
            .ExecuteUpdateAsync(s => s.SetProperty(i => i.UsedAt, usedAt), cancellationToken);
        return rowsChanged == 1;
    }
}
