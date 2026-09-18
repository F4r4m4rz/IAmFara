using IAmFara.Data.Abstractions.Identity;

namespace IAmFara.Identity.Invitations;

/// <summary>
/// Authorizes creating and activating a User — Identity's half of the two
/// invitation flows (see the plan's §2). Consumption/activation itself
/// happens as part of the passkey registration ceremony (PasskeyRegistrationService)
/// so a new User is never created without a passkey also having been
/// successfully registered.
/// </summary>
public class InvitationService(IInvitationRepository invitations)
{
    private static readonly TimeSpan InvitationTtl = TimeSpan.FromDays(7);

    public async Task<(Invitation Invitation, string RawToken)> CreateAsync(string email, Guid? createdByUserId, CancellationToken cancellationToken = default)
    {
        var rawToken = InvitationTokens.GenerateRaw();
        var invitation = new Invitation
        {
            Id = Guid.NewGuid(),
            TokenHash = InvitationTokens.Hash(rawToken),
            Email = email,
            ExpiresAt = DateTimeOffset.UtcNow.Add(InvitationTtl),
            CreatedByUserId = createdByUserId,
            CreatedAt = DateTimeOffset.UtcNow,
        };
        await invitations.AddAsync(invitation, cancellationToken);
        return (invitation, rawToken);
    }

    /// <summary>Read-only — does not consume. Null if the token is malformed, expired, already used, or unknown.</summary>
    public async Task<Invitation?> ValidateAsync(string rawToken, CancellationToken cancellationToken = default)
    {
        var invitation = await invitations.GetByTokenHashAsync(InvitationTokens.Hash(rawToken), cancellationToken);
        if (invitation is null || invitation.UsedAt is not null || invitation.ExpiresAt < DateTimeOffset.UtcNow)
        {
            return null;
        }
        return invitation;
    }

    /// <summary>Atomic conditional consume (see IInvitationRepository.TryConsumeAsync) — false if it was already used or no longer exists.</summary>
    public Task<bool> TryConsumeAsync(Guid invitationId, CancellationToken cancellationToken = default) =>
        invitations.TryConsumeAsync(invitationId, DateTimeOffset.UtcNow, cancellationToken);
}
