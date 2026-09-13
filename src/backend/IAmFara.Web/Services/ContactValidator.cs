using System.Text.RegularExpressions;
using IAmFara.Web.Contracts;

namespace IAmFara.Web.Services;

public static partial class ContactValidator
{
    public static List<ContactValidationError> Validate(ContactRequest request)
    {
        var errors = new List<ContactValidationError>();

        var name = request.Name?.Trim() ?? "";
        if (name.Length is < 1 or > 100)
        {
            errors.Add(new ContactValidationError("name", "Please enter your name."));
        }

        var email = request.Email?.Trim() ?? "";
        if (email.Length > 200 || !EmailPattern().IsMatch(email))
        {
            errors.Add(new ContactValidationError("email", "Please enter a valid email address."));
        }

        var message = request.Message?.Trim() ?? "";
        if (message.Length is < 10 or > 4000)
        {
            errors.Add(new ContactValidationError(
                "message",
                "Message should be between 10 and 4000 characters."));
        }

        return errors;
    }

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$")]
    private static partial Regex EmailPattern();
}
