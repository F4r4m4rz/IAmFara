namespace IAmFara.Data.Abstractions.Finance;

public interface IFixedExpensePeriodOverrideRepository
{
    Task<IReadOnlyList<FixedExpensePeriodOverride>> GetByHouseholdAndPeriodAsync(Guid householdId, string periodId, CancellationToken cancellationToken = default);
    /// <summary>Upsert. Implementations must verify fixedExpenseId belongs to householdId before writing.</summary>
    Task SetAsync(Guid householdId, FixedExpensePeriodOverride @override, CancellationToken cancellationToken = default);
    Task ClearAsync(Guid householdId, Guid fixedExpenseId, string periodId, CancellationToken cancellationToken = default);
}
