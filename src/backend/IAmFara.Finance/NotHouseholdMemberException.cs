namespace IAmFara.Finance;

/// <summary>Thrown when the current user isn't a member of the household they're trying to access.</summary>
public class NotHouseholdMemberException() : Exception("You are not a member of this household.");
