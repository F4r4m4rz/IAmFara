using IAmFara.Data.Abstractions.Finance;
using Microsoft.EntityFrameworkCore;

namespace IAmFara.Data.SqlServer.Finance;

public class FixedMonthlyExpenseRepository(FinanceDbContext db) : IFixedMonthlyExpenseRepository
{
    public Task<FixedMonthlyExpense?> GetByIdAsync(Guid householdId, Guid id, CancellationToken cancellationToken = default) =>
        db.FixedMonthlyExpenses.FirstOrDefaultAsync(e => e.Id == id && e.HouseholdId == householdId, cancellationToken);

    public async Task<IReadOnlyList<FixedMonthlyExpense>> GetByHouseholdIdAsync(Guid householdId, bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var query = db.FixedMonthlyExpenses.Where(e => e.HouseholdId == householdId);
        if (!includeInactive) query = query.Where(e => e.IsActive);
        return await query.ToListAsync(cancellationToken);
    }

    public async Task AddAsync(FixedMonthlyExpense expense, CancellationToken cancellationToken = default)
    {
        db.FixedMonthlyExpenses.Add(expense);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(FixedMonthlyExpense expense, CancellationToken cancellationToken = default)
    {
        db.FixedMonthlyExpenses.Update(expense);
        await db.SaveChangesAsync(cancellationToken);
    }
}
