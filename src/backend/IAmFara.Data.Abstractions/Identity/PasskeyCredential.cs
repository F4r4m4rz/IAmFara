namespace IAmFara.Data.Abstractions.Identity;

/// <summary>One WebAuthn/FIDO2 credential registered to a User.</summary>
public class PasskeyCredential
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public byte[] CredentialId { get; set; } = [];
    public byte[] PublicKey { get; set; } = [];
    public uint SignCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
