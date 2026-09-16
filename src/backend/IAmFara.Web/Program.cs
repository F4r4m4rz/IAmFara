using System.Security.Cryptography;
using System.Text;
using System.Threading.RateLimiting;
using IAmFara.Web.Contracts;
using IAmFara.Web.Data;
using IAmFara.Web.Options;
using IAmFara.Web.Services;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

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

            // The connection string is set directly as an App Pool environment
            // variable ("DbConnectionString") on each SmarterASP.NET site, the
            // same flat-key pattern used for "Email_ApiKey" above, so it's read
            // straight from configuration rather than a bound options section.
            builder.Services.AddDbContext<AnalyticsDbContext>(options =>
                options.UseSqlServer(builder.Configuration["DbConnectionString"]));

            // AnalyticsVisitorHmacKey / AnalyticsReportSecret are set the same
            // way as "DbConnectionString" and "Email_ApiKey" above: flat-key
            // App Pool environment variables in the SmarterASP.NET panel.
            // (An earlier double-underscore "Analytics__VisitorHmacKey" naming,
            // meant to bind straight into the "Analytics" section below via the
            // default environment-variable provider's "__" convention, turned
            // out not to survive SmarterASP.NET's panel — verified via the
            // config-check diagnostic below, where "DbConnectionString" and
            // "Email_ApiKey" read as set but the double-underscore keys didn't.
            // Flat keys read explicitly here avoid relying on that convention.)
            builder.Services.Configure<AnalyticsOptions>(builder.Configuration.GetSection("Analytics"));
            builder.Services.PostConfigure<AnalyticsOptions>(options =>
            {
                options.VisitorHmacKey = builder.Configuration["AnalyticsVisitorHmacKey"] ?? options.VisitorHmacKey;
                options.ReportSecret = builder.Configuration["AnalyticsReportSecret"] ?? options.ReportSecret;
            });
            builder.Services.AddSingleton<GeoIpService>();
            builder.Services.AddSingleton<VisitorKeyService>();
            builder.Services.AddScoped<AnalyticsReportService>();

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

                // Generous enough for a real browsing session (first load + several
                // client-side route changes) while blunting a flood from one IP.
                options.AddPolicy("analytics-visit", httpContext =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 60,
                            Window = TimeSpan.FromMinutes(5),
                            QueueLimit = 0,
                        }));

                // The report endpoint is already protected by a bearer secret; this
                // just blunts brute-force guessing attempts against it.
                options.AddPolicy("analytics-report", httpContext =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 10,
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

            app.MapPost("/api/analytics/visit", async (
                AnalyticsVisitRequest request,
                HttpContext httpContext,
                AnalyticsDbContext db,
                GeoIpService geoIp,
                VisitorKeyService visitorKeyService,
                ILogger<Program> logger,
                CancellationToken ct) =>
            {
                // This endpoint is fire-and-observe from the visitor's perspective:
                // any failure here (DB down, GeoIP unavailable, etc.) is swallowed so
                // it can never surface as a user-visible error or affect the page.
                try
                {
                    var userAgent = httpContext.Request.Headers["User-Agent"].ToString();
                    if (BotFilter.LooksLikeBot(userAgent))
                    {
                        return Results.Ok(new { ok = true });
                    }

                    var path = PathNormalizer.Normalize(request.Path);
                    if (path is null)
                    {
                        return Results.Ok(new { ok = true });
                    }

                    var ip = httpContext.Connection.RemoteIpAddress;
                    var nowUtc = DateTime.UtcNow;
                    var osloDate = OsloClock.ToOsloDate(nowUtc);

                    var visit = new Data.Entities.AnalyticsVisit
                    {
                        OccurredAtUtc = nowUtc,
                        CountryCode = geoIp.Lookup(ip),
                        NormalizedPath = path,
                        DailyVisitorKey = visitorKeyService.ComputeKey(ip, userAgent, osloDate),
                    };

                    db.Visits.Add(visit);
                    await db.SaveChangesAsync(ct);
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Failed to record analytics visit.");
                }

                return Results.Ok(new { ok = true });
            }).RequireRateLimiting("analytics-visit");

            // Temporary diagnostic: lets us confirm what IP SmarterASP.NET's shared
            // hosting actually presents to the app (in case a proxy/load balancer
            // sits in front of it) before relying on RemoteIpAddress for real. Remove
            // once that's verified after a test deploy.
            app.MapGet("/api/analytics/ip-check", (HttpContext httpContext) =>
                Results.Ok(new { remoteIp = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown" }))
                .RequireRateLimiting("analytics-visit");

            // Temporary diagnostic: reports whether each App Pool environment
            // variable / config key the app depends on is actually reaching the
            // running process — booleans only, never the values themselves. Lets
            // us tell "not set" apart from "set but wrong" without exposing
            // anything sensitive. Remove once secret delivery is confirmed working.
            app.MapGet("/api/analytics/config-check", (
                IConfiguration configuration,
                IOptions<ResendOptions> resendOptions,
                IOptions<AnalyticsOptions> analyticsOptions) =>
                Results.Ok(new
                {
                    dbConnectionStringSet = !string.IsNullOrEmpty(configuration["DbConnectionString"]),
                    emailApiKeySet = !string.IsNullOrEmpty(configuration["Email_ApiKey"]),
                    resendApiKeySet = !string.IsNullOrEmpty(resendOptions.Value.ApiKey),
                    resendFromEmailSet = !string.IsNullOrEmpty(resendOptions.Value.FromEmail),
                    analyticsVisitorHmacKeySet = !string.IsNullOrEmpty(analyticsOptions.Value.VisitorHmacKey),
                    analyticsReportSecretSet = !string.IsNullOrEmpty(analyticsOptions.Value.ReportSecret),
                    analyticsReportToEmailSet = !string.IsNullOrEmpty(analyticsOptions.Value.ReportToEmail),
                }))
                .RequireRateLimiting("analytics-visit");

            app.MapPost("/api/analytics/report/run", async (
                HttpContext httpContext,
                AnalyticsReportService reportService,
                IOptions<AnalyticsOptions> analyticsOptions,
                ILogger<Program> logger,
                CancellationToken ct) =>
            {
                var expectedSecret = analyticsOptions.Value.ReportSecret;
                if (string.IsNullOrEmpty(expectedSecret))
                {
                    logger.LogError("Analytics report endpoint called but ReportSecret is not configured.");
                    return Results.Problem(statusCode: StatusCodes.Status503ServiceUnavailable);
                }

                const string bearerPrefix = "Bearer ";
                var authHeader = httpContext.Request.Headers.Authorization.ToString();
                var providedSecret = authHeader.StartsWith(bearerPrefix, StringComparison.Ordinal)
                    ? authHeader[bearerPrefix.Length..]
                    : null;

                if (providedSecret is null || !ConstantTimeEquals(expectedSecret, providedSecret))
                {
                    // Deliberately generic: never reveal *why* auth failed.
                    return Results.Unauthorized();
                }

                try
                {
                    var result = await reportService.RunAsync(ct);
                    var reportDateString = result.ReportDate.ToString("yyyy-MM-dd");

                    return result.Outcome switch
                    {
                        AnalyticsReportOutcome.Sent =>
                            Results.Ok(new AnalyticsReportRunResult("sent", reportDateString)),
                        AnalyticsReportOutcome.AlreadySent =>
                            Results.Ok(new AnalyticsReportRunResult("already-sent", reportDateString)),
                        AnalyticsReportOutcome.NotConfigured =>
                            Results.Problem("Analytics reporting is not fully configured.", statusCode: StatusCodes.Status503ServiceUnavailable),
                        _ => Results.Problem(statusCode: StatusCodes.Status500InternalServerError),
                    };
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Analytics report run failed.");
                    return Results.Problem(
                        "The report run failed. Check server logs for details.",
                        statusCode: StatusCodes.Status500InternalServerError);
                }
            }).RequireRateLimiting("analytics-report");

            app.MapFallbackToFile("index.html");

            app.Run();
        }

        /// <summary>
        /// Constant-time secret comparison — a naive == or SequenceEqual on unequal
        /// lengths would return early and leak timing information about a correct
        /// prefix. Both strings are always fully hashed before comparing so their
        /// original lengths don't matter.
        /// </summary>
        private static bool ConstantTimeEquals(string expected, string provided)
        {
            var expectedHash = SHA256.HashData(Encoding.UTF8.GetBytes(expected));
            var providedHash = SHA256.HashData(Encoding.UTF8.GetBytes(provided));
            return CryptographicOperations.FixedTimeEquals(expectedHash, providedHash);
        }
    }
}
