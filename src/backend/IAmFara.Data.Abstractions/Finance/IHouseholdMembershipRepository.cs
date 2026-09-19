namespace IAmFara.Data.Abstractions.Finance;

public interface IHouseholdMembershipRepository
{
    Task<HouseholdMembership?> GetAsync(Guid userId, Guid householdId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<HouseholdMembership>> GetByHouseholdIdAsync(Guid householdId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<HouseholdMembership>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task AddAsync(HouseholdMembership membership, CancellationToken cancellationToken = default);

    /// <summary>
    /// Atomically removes the membership unless it is the household's last
    /// Owner (a single conditional DELETE with a correlated Owner-count
    /// subquery, not a separate check-then-delete, so two concurrent removal
    /// attempts can't both succeed in leaving a household without an Owner).
    /// Returns true if removed, false if it doesn't exist or is the last Owner.
    /// </summary>
    Task<bool> TryRemoveAsync(Guid householdId, Guid id, CancellationToken cancellationToken = default);
}
