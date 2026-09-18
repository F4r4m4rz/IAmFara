using System.Security.Cryptography;

namespace IAmFara.Finance.Households;

/// <summary>
/// A 256-bit random token, SHA-256 hashed for storage/lookup. Fast,
/// deterministic hashing is correct here (not a slow password-hashing
/// scheme) — the token is high-entropy and random, not a low-entropy
/// human-chosen secret, so it doesn't need brute-force-resistant slow
/// hashing the way a password would.
/// </summary>
internal static class InvitationTokens
{
    public static string GenerateRaw() => Convert.ToHexStringLower(RandomNumberGenerator.GetBytes(32));

    public static byte[] Hash(string rawToken) => SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(rawToken));
}
