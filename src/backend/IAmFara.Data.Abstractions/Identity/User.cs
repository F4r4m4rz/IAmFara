namespace IAmFara.Data.Abstractions.Identity;

/// <summary>
/// A reusable identity, deliberately unaware of Household/Finance concepts
/// so IAmFara.Identity stays usable by future applications beyond this one.
/// </summary>
public class User
{
    public Guid Id { get; set; }
    public string DisplayName { get; set; } = "";
    public string Email { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }
}
