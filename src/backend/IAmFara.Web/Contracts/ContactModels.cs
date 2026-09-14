namespace IAmFara.Web.Contracts;

/// <summary>
/// "Company" is a honeypot field: the real form never shows it to a person,
/// so any request that fills it in is almost certainly a bot.
/// </summary>
public record ContactRequest(string? Name, string? Email, string? Message, string? Company);

public record ContactValidationError(string Field, string Message);
