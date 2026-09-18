namespace IAmFara.Finance.Households;

/// <summary>Deliberately generic message — never reveals whether a token was malformed, expired, already used, or never existed (enumeration resistance).</summary>
public class InvitationInvalidException() : Exception("This invitation link is invalid or has expired.");

public class NotHouseholdOwnerException() : Exception("Only a household Owner can do this.");

public class CannotRemoveLastOwnerException() : Exception("A household must always have at least one Owner.");
