namespace IAmFara.Web.Contracts;

/// <summary>Any authenticated user may send this — it creates a bare identity invitation with no household link, so the recipient always gets their own brand-new household (see POST /api/invitations).</summary>
public record CreateStandaloneInvitationRequest(string Email);
