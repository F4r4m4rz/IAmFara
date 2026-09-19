using Microsoft.AspNetCore.Antiforgery;

namespace IAmFara.Web.Security;

/// <summary>
/// Minimal API endpoints don't get automatic antiforgery validation for JSON
/// bodies the way form-binding endpoints do — this opts a specific
/// state-changing, cookie-authenticated endpoint in explicitly. See
/// RequireAntiforgeryValidation below.
/// </summary>
public class AntiforgeryEndpointFilter(IAntiforgery antiforgery) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        try
        {
            await antiforgery.ValidateRequestAsync(context.HttpContext);
        }
        catch (AntiforgeryValidationException)
        {
            return Results.BadRequest(new { error = "Missing or invalid CSRF token." });
        }

        return await next(context);
    }
}

public static class AntiforgeryEndpointConventionBuilderExtensions
{
    public static RouteHandlerBuilder RequireAntiforgeryValidation(this RouteHandlerBuilder builder) =>
        builder.AddEndpointFilter<AntiforgeryEndpointFilter>();
}
