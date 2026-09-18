namespace IAmFara.Data.Abstractions.Common;

/// <summary>
/// Exposes just the authenticated user's id to Identity/Finance — they never
/// see HttpContext directly. Implemented in IAmFara.Web (the only layer with
/// access to the current request) and provided via DI.
/// </summary>
public interface ICurrentUserAccessor
{
    /// <summary>Null when the current request is unauthenticated.</summary>
    Guid? UserId { get; }
}
