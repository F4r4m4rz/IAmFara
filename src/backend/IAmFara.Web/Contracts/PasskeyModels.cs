using Fido2NetLib;

namespace IAmFara.Web.Contracts;

public record PasskeyRegistrationCompleteRequest(string CeremonyId, AuthenticatorAttestationRawResponse AttestationResponse);

public record PasskeyLoginCompleteRequest(string CeremonyId, AuthenticatorAssertionRawResponse AssertionResponse);

public record PasskeySummary(Guid Id, DateTimeOffset CreatedAt);
