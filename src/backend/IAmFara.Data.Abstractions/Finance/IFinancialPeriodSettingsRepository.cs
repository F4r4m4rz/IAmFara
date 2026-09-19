namespace IAmFara.Data.Abstractions.Finance;

public interface IFinancialPeriodSettingsRepository
{
    /// <summary>Null if never set — callers apply the FinancialPeriodStartDay default themselves.</summary>
    Task<FinancialPeriodSettings?> GetByHouseholdIdAsync(Guid householdId, CancellationToken cancellationToken = default);
    Task UpsertAsync(FinancialPeriodSettings settings, CancellationToken cancellationToken = default);
}
