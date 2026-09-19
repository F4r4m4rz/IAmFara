namespace IAmFara.Data.Abstractions.Finance;

public interface IFixedMonthlyExpenseRepository
{
    Task<FixedMonthlyExpense?> GetByIdAsync(Guid householdId, Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<FixedMonthlyExpense>> GetByHouseholdIdAsync(Guid householdId, bool includeInactive = false, CancellationToken cancellationToken = default);
    Task AddAsync(FixedMonthlyExpense expense, CancellationToken cancellationToken = default);
    Task UpdateAsync(FixedMonthlyExpense expense, CancellationToken cancellationToken = default);
}
