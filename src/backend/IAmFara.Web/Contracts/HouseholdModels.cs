using IAmFara.Data.Abstractions.Finance;
using static IAmFara.Web.Contracts.HouseholdRoleConversions;

namespace IAmFara.Web.Contracts;

public record CreateHouseholdRequest(string Name);

public record CreateHouseholdInvitationRequest(string Email, string Role);

public record ConsumeHouseholdInvitationRequest(string Token);

public record RegisterNewUserBeginRequest(string Token, string DisplayName);

public record MyHouseholdDto(Guid Id, string Name, string Role)
{
    public static MyHouseholdDto From(Household household, HouseholdRole role) => new(household.Id, household.Name, RoleToString(role));
}

public record HouseholdMemberDto(Guid UserId, string DisplayName, string Email, string Role)
{
    public static HouseholdMemberDto From(Guid userId, string displayName, string email, HouseholdRole role) => new(userId, displayName, email, RoleToString(role));
}

internal static class HouseholdRoleConversions
{
    public static string RoleToString(HouseholdRole role) => role switch
    {
        HouseholdRole.Member => "member",
        HouseholdRole.Owner => "owner",
        _ => throw new ArgumentOutOfRangeException(nameof(role)),
    };

    public static HouseholdRole RoleFromString(string role) => role switch
    {
        "member" => HouseholdRole.Member,
        "owner" => HouseholdRole.Owner,
        _ => throw new ArgumentException($"Unknown household role \"{role}\".", nameof(role)),
    };
}
