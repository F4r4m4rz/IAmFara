namespace IAmFara.Data.Abstractions.Identity;

public interface IInvitationRepository
{
    Task<Invitation?> GetByTokenHashAsync(byte[] tokenHash, CancellationToken cancellationToken = default);
    Task AddAsync(Invitation invitation, CancellationToken cancellationToken = default);

    /// <summary>
    /// Atomically marks the invitation used only if it hasn't been consumed yet
    /// (a single conditional UPDATE, not a separate check-then-update), so two
    /// concurrent redemption attempts can't both succeed. Returns true if this
    /// call consumed it, false if it was already used or doesn't exist.
    /// </summary>
    Task<bool> TryConsumeAsync(Guid id, DateTimeOffset usedAt, CancellationToken cancellationToken = default);
}
