namespace IAmFara.Data.Abstractions.Finance;

public interface IHouseholdMembershipRepository
{
    Task<HouseholdMembership?> GetAsync(Guid userId, Guid householdId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<HouseholdMembership>> GetByHouseholdIdAsync(Guid householdId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<HouseholdMembership>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task AddAsync(HouseholdMembership membership, CancellationToken cancellationToken = default);
    Task RemoveAsync(Guid householdId, Guid id, CancellationToken cancellationToken = default);
}
