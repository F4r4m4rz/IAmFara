namespace IAmFara.Data.Abstractions.Finance;

/// <summary>
/// Links an identity.Users row to a Household. UserId carries no database-level
/// foreign key: IdentityDbContext and FinanceDbContext are separate contexts by
/// design, so cross-context referential integrity — and the "who's a member"
/// authorization check itself — happens in application code, not the database
/// (the same reasoning the plan already applies to HouseholdInvitation
/// .IdentityInvitationId).
/// </summary>
public class HouseholdMembership
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid HouseholdId { get; set; }
    public HouseholdRole Role { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
