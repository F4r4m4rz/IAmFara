using IAmFara.Data.Abstractions.Finance;
using Microsoft.EntityFrameworkCore;

namespace IAmFara.Data.SqlServer.Finance;

public class FinancialPeriodSettingsRepository(FinanceDbContext db) : IFinancialPeriodSettingsRepository
{
    public Task<FinancialPeriodSettings?> GetByHouseholdIdAsync(Guid householdId, CancellationToken cancellationToken = default) =>
        db.FinancialPeriodSettings.FirstOrDefaultAsync(s => s.HouseholdId == householdId, cancellationToken);

    public async Task UpsertAsync(FinancialPeriodSettings settings, CancellationToken cancellationToken = default)
    {
        var existing = await db.FinancialPeriodSettings.FirstOrDefaultAsync(s => s.HouseholdId == settings.HouseholdId, cancellationToken);

        if (existing is null)
        {
            db.FinancialPeriodSettings.Add(settings);
        }
        else
        {
            existing.FinancialPeriodStartDay = settings.FinancialPeriodStartDay;
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}
