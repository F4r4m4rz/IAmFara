using IAmFara.Data.Abstractions.Finance;
using Microsoft.EntityFrameworkCore;

namespace IAmFara.Data.SqlServer.Finance;

public class HouseholdMembershipRepository(FinanceDbContext db) : IHouseholdMembershipRepository
{
    public Task<HouseholdMembership?> GetAsync(Guid userId, Guid householdId, CancellationToken cancellationToken = default) =>
        db.HouseholdMemberships.FirstOrDefaultAsync(m => m.UserId == userId && m.HouseholdId == householdId, cancellationToken);

    public async Task<IReadOnlyList<HouseholdMembership>> GetByHouseholdIdAsync(Guid householdId, CancellationToken cancellationToken = default) =>
        await db.HouseholdMemberships.Where(m => m.HouseholdId == householdId).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<HouseholdMembership>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default) =>
        await db.HouseholdMemberships.Where(m => m.UserId == userId).ToListAsync(cancellationToken);

    public async Task AddAsync(HouseholdMembership membership, CancellationToken cancellationToken = default)
    {
        db.HouseholdMemberships.Add(membership);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveAsync(Guid householdId, Guid id, CancellationToken cancellationToken = default)
    {
        await db.HouseholdMemberships
            .Where(m => m.Id == id && m.HouseholdId == householdId)
            .ExecuteDeleteAsync(cancellationToken);
    }
}
