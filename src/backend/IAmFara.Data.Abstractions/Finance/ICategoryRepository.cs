namespace IAmFara.Data.Abstractions.Finance;

public interface ICategoryRepository
{
    Task<Category?> GetByIdAsync(Guid householdId, Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Category>> GetByHouseholdIdAsync(Guid householdId, CancellationToken cancellationToken = default);
    Task AddAsync(Category category, CancellationToken cancellationToken = default);
    Task UpdateAsync(Category category, CancellationToken cancellationToken = default);
    /// <summary>Throws if any transaction still references this category — enforced by a database-level Restrict foreign key.</summary>
    Task DeleteAsync(Guid householdId, Guid id, CancellationToken cancellationToken = default);
}
