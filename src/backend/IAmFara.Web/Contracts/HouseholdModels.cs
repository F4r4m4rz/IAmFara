using IAmFara.Data.Abstractions.Finance;

namespace IAmFara.Web.Contracts;

public record CreateHouseholdRequest(string Name);

public record CreateHouseholdInvitationRequest(string Email, HouseholdRole Role);

public record ConsumeHouseholdInvitationRequest(string Token);

public record RegisterNewUserBeginRequest(string Token, string DisplayName);

public record MyHouseholdDto(Guid Id, string Name, HouseholdRole Role);

public record HouseholdMemberDto(Guid UserId, string DisplayName, string Email, HouseholdRole Role);
