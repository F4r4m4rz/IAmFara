using System.Threading.RateLimiting;
using IAmFara.Web.Contracts;
using IAmFara.Web.Options;
using IAmFara.Web.Services;
using Microsoft.AspNetCore.RateLimiting;

namespace IAmFara.Web
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers();
            builder.Services.AddRazorPages();

            builder.Services.Configure<ResendOptions>(builder.Configuration.GetSection("Resend"));
            // The Resend API key is set directly as an App Pool environment
            // variable in the SmarterASP.NET control panel (named
            // "Email_ApiKey"), rather than flowing through CI/web.config like
            // the rest of the contact-form config — this keeps it from
            // getting reset to empty on every deploy in case that CI wiring
            // is ever dropped or changed. Falls back to whatever the
            // "Resend:ApiKey" section provided (e.g. local dev secrets) when
            // that env var isn't set.
            builder.Services.PostConfigure<ResendOptions>(options =>
            {
                options.ApiKey = builder.Configuration["Email_ApiKey"] ?? options.ApiKey;
            });
            builder.Services.Configure<ContactOptions>(builder.Configuration.GetSection("Contact"));
            builder.Services.AddSingleton<HttpClient>();
            builder.Services.AddSingleton<ContactEmailSender>();

            builder.Services.AddRateLimiter(options =>
            {
                options.OnRejected = async (context, ct) =>
                {
                    context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                    context.HttpContext.Response.ContentType = "application/json";
                    await context.HttpContext.Response.WriteAsync(
                        """{"error":"Too many requests. Please try again in a few minutes."}""",
                        ct);
                };

                options.AddPolicy("contact", httpContext =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 3,
                            Window = TimeSpan.FromMinutes(10),
                            QueueLimit = 0,
                        }));
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            if (!app.Environment.IsStaging())
            {
                app.UseHttpsRedirection();
            }

            app.UseStaticFiles();

            app.UseRouting();

            app.UseRateLimiter();

            app.UseAuthorization();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            // Temporary diagnostic: reports which contact-form settings are
            // present without ever exposing their values — for sanity-
            // checking a deploy's config remotely. Safe to remove later.
            app.MapGet("/api/contact/status", (ContactEmailSender emailSender) =>
                Results.Ok(emailSender.ConfigStatus));

            app.MapPost("/api/contact", async (
                ContactRequest request,
                ContactEmailSender emailSender,
                ILogger<Program> logger,
                CancellationToken ct) =>
            {
                // Honeypot: real visitors never see or fill this field in, so a
                // filled-in value means a bot. Pretend it worked and move on.
                if (!string.IsNullOrWhiteSpace(request.Company))
                {
                    return Results.Ok(new { ok = true });
                }

                var errors = ContactValidator.Validate(request);
                if (errors.Count > 0)
                {
                    return Results.ValidationProblem(
                        errors.GroupBy(e => e.Field).ToDictionary(g => g.Key, g => g.Select(e => e.Message).ToArray()));
                }

                if (!emailSender.IsConfigured)
                {
                    logger.LogError("Contact form submitted but the Resend/contact email settings aren't configured.");
                    return Results.Problem(
                        "The contact form isn't fully set up yet. Please email me directly instead.",
                        statusCode: StatusCodes.Status503ServiceUnavailable);
                }

                try
                {
                    await emailSender.SendAsync(
                        request.Name!.Trim(),
                        request.Email!.Trim(),
                        request.Message!.Trim(),
                        ct);
                    return Results.Ok(new { ok = true });
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Failed to send contact form email.");
                    return Results.Problem(
                        "Something went wrong sending your message. Please try again in a bit.",
                        statusCode: StatusCodes.Status500InternalServerError);
                }
            }).RequireRateLimiting("contact");

            app.MapFallbackToFile("index.html");

            app.Run();
        }
    }
}
