namespace IAmFara.Data.Abstractions.Finance;

public interface ITransactionRepository
{
    Task<Transaction?> GetByIdAsync(Guid householdId, Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Transaction>> GetByHouseholdIdAsync(Guid householdId, TransactionFilter? filter = null, CancellationToken cancellationToken = default);
    Task AddAsync(Transaction transaction, CancellationToken cancellationToken = default);
    Task UpdateAsync(Transaction transaction, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid householdId, Guid id, CancellationToken cancellationToken = default);
}
