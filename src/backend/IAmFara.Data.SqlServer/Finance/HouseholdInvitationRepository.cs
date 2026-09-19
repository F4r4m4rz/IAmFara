using IAmFara.Data.Abstractions.Finance;
using Microsoft.EntityFrameworkCore;

namespace IAmFara.Data.SqlServer.Finance;

public class HouseholdInvitationRepository(FinanceDbContext db) : IHouseholdInvitationRepository
{
    public Task<HouseholdInvitation?> GetByTokenHashAsync(byte[] tokenHash, CancellationToken cancellationToken = default) =>
        db.HouseholdInvitations.FirstOrDefaultAsync(i => i.TokenHash == tokenHash, cancellationToken);

    public Task<HouseholdInvitation?> GetByIdentityInvitationIdAsync(Guid identityInvitationId, CancellationToken cancellationToken = default) =>
        db.HouseholdInvitations.FirstOrDefaultAsync(i => i.IdentityInvitationId == identityInvitationId, cancellationToken);

    public async Task AddAsync(HouseholdInvitation invitation, CancellationToken cancellationToken = default)
    {
        db.HouseholdInvitations.Add(invitation);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> TryConsumeAsync(Guid id, DateTimeOffset usedAt, CancellationToken cancellationToken = default)
    {
        // ExpiresAt must be part of the same atomic condition as UsedAt — see
        // the identical fix in Identity's InvitationRepository. Notably,
        // HouseholdFacade.TryJoinFromLinkedIdentityInvitationAsync calls this
        // with no separate expiry check at all beforehand, so this atomic
        // check is the only enforcement for that path.
        // DateTimeOffset.Compare(...), not a plain >= on the two
        // DateTimeOffset values — EF Core's SQLite provider (used by this
        // app's unit tests, not production) can't translate a direct
        // comparison operator on DateTimeOffset inside ExecuteUpdateAsync
        // specifically (verified empirically); both providers translate the
        // Compare() form without issue.
        var rowsChanged = await db.HouseholdInvitations
            .Where(i => i.Id == id && i.UsedAt == null && DateTimeOffset.Compare(i.ExpiresAt, usedAt) >= 0)
            .ExecuteUpdateAsync(s => s.SetProperty(i => i.UsedAt, usedAt), cancellationToken);
        return rowsChanged == 1;
    }
}
