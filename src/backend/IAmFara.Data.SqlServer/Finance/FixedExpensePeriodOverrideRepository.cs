using IAmFara.Data.Abstractions.Finance;
using Microsoft.EntityFrameworkCore;

namespace IAmFara.Data.SqlServer.Finance;

public class FixedExpensePeriodOverrideRepository(FinanceDbContext db) : IFixedExpensePeriodOverrideRepository
{
    public async Task<IReadOnlyList<FixedExpensePeriodOverride>> GetByHouseholdAndPeriodAsync(Guid householdId, string periodId, CancellationToken cancellationToken = default) =>
        await db.FixedExpensePeriodOverrides
            .Where(o => o.PeriodId == periodId && db.FixedMonthlyExpenses
                .Any(e => e.Id == o.FixedExpenseId && e.HouseholdId == householdId))
            .ToListAsync(cancellationToken);

    public async Task SetAsync(Guid householdId, FixedExpensePeriodOverride @override, CancellationToken cancellationToken = default)
    {
        var belongsToHousehold = await db.FixedMonthlyExpenses
            .AnyAsync(e => e.Id == @override.FixedExpenseId && e.HouseholdId == householdId, cancellationToken);
        if (!belongsToHousehold) throw new InvalidOperationException("Fixed expense does not belong to the given household.");

        var existing = await db.FixedExpensePeriodOverrides.FirstOrDefaultAsync(
            o => o.FixedExpenseId == @override.FixedExpenseId && o.PeriodId == @override.PeriodId, cancellationToken);

        if (existing is null)
        {
            db.FixedExpensePeriodOverrides.Add(@override);
        }
        else
        {
            existing.AmountMinor = @override.AmountMinor;
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task ClearAsync(Guid householdId, Guid fixedExpenseId, string periodId, CancellationToken cancellationToken = default)
    {
        await db.FixedExpensePeriodOverrides
            .Where(o => o.FixedExpenseId == fixedExpenseId && o.PeriodId == periodId && db.FixedMonthlyExpenses
                .Any(e => e.Id == fixedExpenseId && e.HouseholdId == householdId))
            .ExecuteDeleteAsync(cancellationToken);
    }
}
