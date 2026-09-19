namespace IAmFara.Data.Abstractions.Finance;

public interface IHouseholdRepository
{
    Task<Household?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Household household, CancellationToken cancellationToken = default);
}
