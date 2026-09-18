namespace IAmFara.Data.Abstractions.Finance;

/// <summary>
/// Finance's own, self-sufficient invitation to join an existing household —
/// independent of identity.Invitations, so inviting an existing user never
/// touches Identity at all. IdentityInvitationId is populated only when the
/// recipient doesn't have an identity yet (linked for traceability only; no
/// database FK, since that would be a cross-context reference — see §2/§3 of
/// the plan). CreatedByUserId is likewise a plain Guid with no database FK.
/// </summary>
public class HouseholdInvitation
{
    public Guid Id { get; set; }
    public byte[] TokenHash { get; set; } = [];
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? UsedAt { get; set; }
    public Guid HouseholdId { get; set; }
    public HouseholdRole Role { get; set; }
    public Guid? IdentityInvitationId { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
