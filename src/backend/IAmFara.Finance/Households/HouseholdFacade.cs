using IAmFara.Data.Abstractions.Finance;

namespace IAmFara.Finance.Households;

/// <summary>
/// Households, memberships, and household invitations. Every method re-derives
/// the acting user from an explicit currentUserId parameter (the composition
/// root supplies it from ICurrentUserAccessor — never from a request body,
/// query, or route value) and checks HouseholdMembership before doing
/// anything; CreatedByUserId is audit-only and is never used for authorization.
/// </summary>
public class HouseholdFacade(
    IHouseholdRepository households,
    IHouseholdMembershipRepository memberships,
    IHouseholdInvitationRepository invitations)
{
    private static readonly TimeSpan InvitationTtl = TimeSpan.FromDays(7);

    public async Task<Household> CreateHouseholdAsync(Guid creatorUserId, string name, CancellationToken cancellationToken = default)
    {
        var household = new Household { Id = Guid.NewGuid(), Name = name, CreatedAt = DateTimeOffset.UtcNow };
        await households.AddAsync(household, cancellationToken);
        await memberships.AddAsync(new HouseholdMembership
        {
            Id = Guid.NewGuid(),
            UserId = creatorUserId,
            HouseholdId = household.Id,
            Role = HouseholdRole.Owner,
            CreatedAt = DateTimeOffset.UtcNow,
        }, cancellationToken);
        return household;
    }

    /// <summary>Only an Owner may invite someone into their household — matches §19's example split (a product decision, flagged in the plan).</summary>
    public async Task<(HouseholdInvitation Invitation, string RawToken)> CreateInvitationAsync(
        Guid currentUserId, Guid householdId, HouseholdRole role, Guid? identityInvitationId = null, CancellationToken cancellationToken = default)
    {
        await RequireOwnerAsync(currentUserId, householdId, cancellationToken);

        var rawToken = InvitationTokens.GenerateRaw();
        var invitation = new HouseholdInvitation
        {
            Id = Guid.NewGuid(),
            TokenHash = InvitationTokens.Hash(rawToken),
            ExpiresAt = DateTimeOffset.UtcNow.Add(InvitationTtl),
            HouseholdId = householdId,
            Role = role,
            IdentityInvitationId = identityInvitationId,
            CreatedByUserId = currentUserId,
            CreatedAt = DateTimeOffset.UtcNow,
        };
        await invitations.AddAsync(invitation, cancellationToken);
        return (invitation, rawToken);
    }

    /// <summary>
    /// An existing, already-authenticated user redeeming a household invitation
    /// they received — the household to join comes from the invitation itself,
    /// never from client input, so a token can't be redeemed for a different
    /// household than it names.
    /// </summary>
    public async Task<HouseholdMembership> ConsumeInvitationAsync(Guid currentUserId, string rawToken, CancellationToken cancellationToken = default)
    {
        var invitation = await invitations.GetByTokenHashAsync(InvitationTokens.Hash(rawToken), cancellationToken)
            ?? throw new InvitationInvalidException();
        if (invitation.ExpiresAt < DateTimeOffset.UtcNow) throw new InvitationInvalidException();

        var consumed = await invitations.TryConsumeAsync(invitation.Id, DateTimeOffset.UtcNow, cancellationToken);
        if (!consumed) throw new InvitationInvalidException();

        return await JoinHouseholdAsync(currentUserId, invitation, cancellationToken);
    }

    /// <summary>
    /// The "existing household, new user" flow (see the plan's §2): looks for a
    /// finance.HouseholdInvitations row linked to the identity invitation that
    /// just activated a new User and, if one exists, atomically consumes it and
    /// joins that household. Returns null if none is linked — the composition
    /// root then knows to create a brand-new household instead (the "new
    /// household" flow).
    /// </summary>
    public async Task<HouseholdMembership?> TryJoinFromLinkedIdentityInvitationAsync(Guid userId, Guid identityInvitationId, CancellationToken cancellationToken = default)
    {
        var linked = await invitations.GetByIdentityInvitationIdAsync(identityInvitationId, cancellationToken);
        if (linked is null) return null;

        var consumed = await invitations.TryConsumeAsync(linked.Id, DateTimeOffset.UtcNow, cancellationToken);
        if (!consumed) return null;

        return await JoinHouseholdAsync(userId, linked, cancellationToken);
    }

    private async Task<HouseholdMembership> JoinHouseholdAsync(Guid userId, HouseholdInvitation invitation, CancellationToken cancellationToken)
    {
        var membership = new HouseholdMembership
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            HouseholdId = invitation.HouseholdId,
            Role = invitation.Role,
            CreatedAt = DateTimeOffset.UtcNow,
        };
        await memberships.AddAsync(membership, cancellationToken);
        return membership;
    }

    public async Task RemoveMemberAsync(Guid currentUserId, Guid householdId, Guid membershipId, CancellationToken cancellationToken = default)
    {
        await RequireOwnerAsync(currentUserId, householdId, cancellationToken);

        var removed = await memberships.TryRemoveAsync(householdId, membershipId, cancellationToken);
        if (removed) return;

        // The atomic delete's own condition is what actually enforces the
        // invariant race-free; this lookup only picks the right error message.
        var target = (await memberships.GetByHouseholdIdAsync(householdId, cancellationToken))
            .FirstOrDefault(m => m.Id == membershipId);
        throw target is null ? new KeyNotFoundException() : new CannotRemoveLastOwnerException();
    }

    private async Task RequireOwnerAsync(Guid userId, Guid householdId, CancellationToken cancellationToken)
    {
        var membership = await memberships.GetAsync(userId, householdId, cancellationToken);
        if (membership is null || membership.Role != HouseholdRole.Owner)
        {
            throw new NotHouseholdOwnerException();
        }
    }
}
