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
        var rowsChanged = await db.HouseholdInvitations
            .Where(i => i.Id == id && i.UsedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(i => i.UsedAt, usedAt), cancellationToken);
        return rowsChanged == 1;
    }
}
