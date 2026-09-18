namespace IAmFara.Data.Abstractions.Identity;

/// <summary>
/// Authorizes creating and activating a User (registering their first
/// passkey). Has no idea what happens after activation — that's orchestrated
/// by the composition root, which is the only layer allowed to know about
/// both Identity and Finance concepts.
/// </summary>
public class Invitation
{
    public Guid Id { get; set; }
    public byte[] TokenHash { get; set; } = [];
    /// <summary>Who this invitation is for — the new User's Email once activated.</summary>
    public string Email { get; set; } = "";
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? UsedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
