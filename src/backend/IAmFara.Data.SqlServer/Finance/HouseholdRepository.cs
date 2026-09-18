using IAmFara.Data.Abstractions.Finance;
using Microsoft.EntityFrameworkCore;

namespace IAmFara.Data.SqlServer.Finance;

public class HouseholdRepository(FinanceDbContext db) : IHouseholdRepository
{
    public Task<Household?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        db.Households.FirstOrDefaultAsync(h => h.Id == id, cancellationToken);

    public async Task AddAsync(Household household, CancellationToken cancellationToken = default)
    {
        db.Households.Add(household);
        await db.SaveChangesAsync(cancellationToken);
    }
}
