using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.RateLimiting;
using Fido2NetLib;
using IAmFara.Data.Abstractions.Common;
using IAmFara.Data.Abstractions.Finance;
using IAmFara.Data.Abstractions.Identity;
using IAmFara.Data.SqlServer.Finance;
using IAmFara.Data.SqlServer.Identity;
using IAmFara.Finance;
using IAmFara.Finance.Households;
using IAmFara.Identity.Invitations;
using IAmFara.Identity.Passkeys;
using IAmFara.Web.Contracts;
using IAmFara.Web.Data;
using IAmFara.Web.Options;
using IAmFara.Web.Security;
using IAmFara.Web.Services;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using static IAmFara.Web.Contracts.FinanceDtoConversions;
using static IAmFara.Web.Contracts.HouseholdRoleConversions;

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

            // Same physical database as AnalyticsDbContext above, schema-separated
            // ("identity" vs. "dbo") rather than a second connection string.
            builder.Services.AddDbContext<IdentityDbContext>(options =>
                options.UseSqlServer(builder.Configuration["DbConnectionString"]));
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IPasskeyCredentialRepository, PasskeyCredentialRepository>();
            builder.Services.AddScoped<IInvitationRepository, InvitationRepository>();

            // Same physical database again, "finance" schema.
            builder.Services.AddDbContext<FinanceDbContext>(options =>
                options.UseSqlServer(builder.Configuration["DbConnectionString"]));
            builder.Services.AddScoped<IHouseholdRepository, HouseholdRepository>();
            builder.Services.AddScoped<IHouseholdMembershipRepository, HouseholdMembershipRepository>();
            builder.Services.AddScoped<IHouseholdInvitationRepository, HouseholdInvitationRepository>();
            builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
            builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
            builder.Services.AddScoped<IFixedMonthlyExpenseRepository, FixedMonthlyExpenseRepository>();
            builder.Services.AddScoped<IFixedExpensePeriodOverrideRepository, FixedExpensePeriodOverrideRepository>();
            builder.Services.AddScoped<IFinancialPeriodSettingsRepository, FinancialPeriodSettingsRepository>();

            builder.Services.AddHttpContextAccessor();
            builder.Services.AddScoped<ICurrentUserAccessor, HttpContextCurrentUserAccessor>();

            builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                .AddCookie(options =>
                {
                    options.Cookie.Name = "IAmFara.Auth";
                    options.Cookie.HttpOnly = true;
                    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                    options.Cookie.SameSite = SameSiteMode.Lax;
                    options.ExpireTimeSpan = TimeSpan.FromDays(30);
                    options.SlidingExpiration = true;
                    // This is a JSON API, not an MVC app with a login page — a
                    // request that fails auth should get a plain status code,
                    // never a redirect to a page that doesn't exist.
                    options.Events.OnRedirectToLogin = context =>
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        return Task.CompletedTask;
                    };
                    options.Events.OnRedirectToAccessDenied = context =>
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        return Task.CompletedTask;
                    };
                });

            builder.Services.AddAuthorization(options =>
            {
                // Deny-by-default: an endpoint added without an explicit
                // .AllowAnonymous() call fails closed, not open.
                options.FallbackPolicy = new AuthorizationPolicyBuilder()
                    .RequireAuthenticatedUser()
                    .Build();
            });

            builder.Services.AddAntiforgery(options =>
            {
                options.Cookie.Name = "IAmFara.Csrf";
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.HeaderName = "X-CSRF-TOKEN";
            });

            // WebAuthnServerDomain is set the same way as DbConnectionString/
            // Email_ApiKey above (a flat App Pool environment variable) once
            // deployed; "localhost" is the WebAuthn spec's own secure-context
            // exception, used here as the local-dev default so both launch
            // profiles' origins work without any config.
            var webAuthnServerDomain = builder.Configuration["WebAuthnServerDomain"] ?? "localhost";
            builder.Services.AddFido2(options =>
            {
                options.ServerDomain = webAuthnServerDomain;
                options.ServerName = "IAmFara";
                options.Origins = webAuthnServerDomain == "localhost"
                    ? new HashSet<string> { "http://localhost:5020", "https://localhost:7142" }
                    : new HashSet<string> { $"https://{webAuthnServerDomain}" };
            });
            builder.Services.AddMemoryCache();
            builder.Services.AddScoped<InvitationService>();
            builder.Services.AddScoped<PasskeyRegistrationService>();
            builder.Services.AddScoped<PasskeyAuthenticationService>();
            builder.Services.AddScoped<PasskeyManagementService>();
            builder.Services.AddScoped<HouseholdFacade>();
            builder.Services.AddScoped<FinanceFacade>();

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

                // Blunts brute-force/enumeration attempts against the passkey
                // ceremony endpoints — a legitimate user rarely retries a
                // ceremony more than a handful of times in a row.
                options.AddPolicy("passkey-ceremony", httpContext =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 20,
                            Window = TimeSpan.FromMinutes(10),
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

            app.UseAuthentication();
            app.UseAuthorization();
            app.UseAntiforgery();

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
            }).RequireRateLimiting("contact").AllowAnonymous();

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
            }).RequireRateLimiting("analytics-visit").AllowAnonymous();

            // Temporary diagnostic: lets us confirm what IP SmarterASP.NET's shared
            // hosting actually presents to the app (in case a proxy/load balancer
            // sits in front of it) before relying on RemoteIpAddress for real. Remove
            // once that's verified after a test deploy.
            app.MapGet("/api/analytics/ip-check", (HttpContext httpContext) =>
                Results.Ok(new { remoteIp = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown" }))
                .RequireRateLimiting("analytics-visit")
                .AllowAnonymous();

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
                .RequireRateLimiting("analytics-visit")
                .AllowAnonymous();

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
            }).RequireRateLimiting("analytics-report").AllowAnonymous();

            // Deliberately minimal — the frontend's own auth UI is built in a
            // later phase, but any SPA needs a "who am I" check on load, and it
            // exercises the full cookie-auth + FallbackPolicy + ICurrentUserAccessor
            // pipeline as real production surface rather than a test-only stub.
            app.MapGet("/api/auth/me", (ICurrentUserAccessor currentUser) =>
                Results.Ok(new { userId = currentUser.UserId }));

            // Obtains a CSRF token to echo back via the X-CSRF-TOKEN header on
            // state-changing requests (see AntiforgeryEndpointFilter). Anonymous
            // because the invitation/registration endpoints of later phases need
            // one before a session exists.
            app.MapGet("/api/auth/csrf-token", (IAntiforgery antiforgery, HttpContext context) =>
            {
                var tokens = antiforgery.GetAndStoreTokens(context);
                return Results.Ok(new { token = tokens.RequestToken });
            }).AllowAnonymous();

            app.MapPost("/api/auth/sign-out", async (HttpContext context) =>
            {
                await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                return Results.Ok();
            }).RequireAntiforgeryValidation();

            // Passkey registration: adding a credential to the caller's own,
            // already-authenticated account. There is no anonymous "register a
            // new user" path here — that's an invitation-gated flow added in a
            // later phase, reusing this same ceremony machinery.
            app.MapPost("/api/auth/passkeys/register/begin", async (
                ICurrentUserAccessor currentUser,
                PasskeyRegistrationService registration,
                HttpContext context,
                CancellationToken ct) =>
            {
                var (ceremonyId, options) = await registration.BeginAsync(currentUser.UserId!.Value, ct);
                context.Response.Headers["X-Ceremony-Id"] = ceremonyId;
                return Results.Ok(options);
            }).RequireRateLimiting("passkey-ceremony");

            app.MapPost("/api/auth/passkeys/register/complete", async (
                ICurrentUserAccessor currentUser,
                PasskeyRegistrationService registration,
                PasskeyRegistrationCompleteRequest request,
                ILogger<Program> logger,
                CancellationToken ct) =>
            {
                try
                {
                    await registration.CompleteAsync(currentUser.UserId!.Value, request.CeremonyId, request.AttestationResponse, ct);
                    return Results.Ok();
                }
                catch (Exception ex) when (ex is Fido2VerificationException or InvalidOperationException)
                {
                    logger.LogWarning(ex, "Passkey registration failed.");
                    return Results.BadRequest(new { error = "Registration could not be completed." });
                }
            }).RequireRateLimiting("passkey-ceremony").RequireAntiforgeryValidation();

            // Usernameless/discoverable-credential login — no anonymous state is
            // mutated by beginning a ceremony, so this (unlike /complete below)
            // doesn't need CSRF protection; a WebAuthn assertion is itself
            // cryptographically bound to this origin and the user's own
            // authenticator, which is what actually defeats forgery here, not a
            // separate CSRF token.
            app.MapPost("/api/auth/passkeys/login/begin", (PasskeyAuthenticationService authentication, HttpContext context) =>
            {
                var (ceremonyId, options) = authentication.Begin();
                context.Response.Headers["X-Ceremony-Id"] = ceremonyId;
                return Results.Ok(options);
            }).RequireRateLimiting("passkey-ceremony").AllowAnonymous();

            app.MapPost("/api/auth/passkeys/login/complete", async (
                PasskeyAuthenticationService authentication,
                PasskeyLoginCompleteRequest request,
                HttpContext context,
                CancellationToken ct) =>
            {
                var userId = await authentication.CompleteAsync(request.CeremonyId, request.AssertionResponse, ct);
                if (userId is null)
                {
                    // Deliberately generic: never reveal *why* the assertion failed.
                    return Results.Unauthorized();
                }

                var claims = new[] { new Claim(ClaimTypes.NameIdentifier, userId.Value.ToString()) };
                var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                await context.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));
                return Results.Ok(new { userId = userId.Value });
            }).RequireRateLimiting("passkey-ceremony").AllowAnonymous();

            app.MapGet("/api/auth/passkeys", async (ICurrentUserAccessor currentUser, PasskeyManagementService management, CancellationToken ct) =>
            {
                var credentials = await management.ListAsync(currentUser.UserId!.Value, ct);
                return Results.Ok(credentials.Select(c => new PasskeySummary(c.Id, c.CreatedAt)));
            });

            app.MapDelete("/api/auth/passkeys/{id:guid}", async (
                Guid id,
                ICurrentUserAccessor currentUser,
                PasskeyManagementService management,
                CancellationToken ct) =>
            {
                try
                {
                    await management.RemoveAsync(currentUser.UserId!.Value, id, ct);
                    return Results.Ok();
                }
                catch (InvalidOperationException ex)
                {
                    return Results.BadRequest(new { error = ex.Message });
                }
            }).RequireAntiforgeryValidation();

            // Passkey registration for a brand-new user, authorized by a valid
            // identity invitation instead of an existing session — the second
            // (and only other) way a passkey can be registered at all, per
            // PasskeyRegistrationService's own summary.
            app.MapPost("/api/auth/passkeys/register-new-user/begin", async (
                PasskeyRegistrationService registration,
                RegisterNewUserBeginRequest request,
                HttpContext context,
                ILogger<Program> logger,
                CancellationToken ct) =>
            {
                try
                {
                    var (ceremonyId, options) = await registration.BeginForNewUserAsync(request.Token, request.DisplayName, ct);
                    context.Response.Headers["X-Ceremony-Id"] = ceremonyId;
                    return Results.Ok(options);
                }
                catch (InvalidOperationException ex)
                {
                    logger.LogWarning(ex, "New-user passkey registration begin failed.");
                    return Results.BadRequest(new { error = "This invitation link is invalid or has expired." });
                }
            }).RequireRateLimiting("passkey-ceremony").AllowAnonymous();

            // On success, joins the household linked to the invitation (the
            // "existing household, new user" flow) or creates a new one (the
            // "new household" flow) — see HouseholdFacade
            // .TryJoinFromLinkedIdentityInvitationAsync — then signs the new
            // user in. Not CSRF-protected, same reasoning as login/complete:
            // the WebAuthn assertion's own origin binding is what defeats
            // forgery here, and there's no session to forge into yet anyway.
            app.MapPost("/api/auth/passkeys/register-new-user/complete", async (
                PasskeyRegistrationService registration,
                HouseholdFacade householdFacade,
                PasskeyRegistrationCompleteRequest request,
                HttpContext context,
                ILogger<Program> logger,
                CancellationToken ct) =>
            {
                try
                {
                    var (user, identityInvitationId) = await registration.CompleteForNewUserAsync(request.CeremonyId, request.AttestationResponse, ct);

                    var membership = await householdFacade.TryJoinFromLinkedIdentityInvitationAsync(user.Id, identityInvitationId, ct);
                    if (membership is null)
                    {
                        await householdFacade.CreateHouseholdAsync(user.Id, $"{user.DisplayName}'s Household", ct);
                    }

                    var claims = new[] { new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()) };
                    var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                    await context.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));
                    return Results.Ok(new { userId = user.Id });
                }
                catch (Exception ex) when (ex is Fido2VerificationException or InvalidOperationException)
                {
                    logger.LogWarning(ex, "New-user passkey registration failed.");
                    return Results.BadRequest(new { error = "Registration could not be completed." });
                }
            }).RequireRateLimiting("passkey-ceremony").AllowAnonymous();

            app.MapPost("/api/households", async (
                ICurrentUserAccessor currentUser,
                HouseholdFacade householdFacade,
                CreateHouseholdRequest request,
                CancellationToken ct) =>
            {
                var household = await householdFacade.CreateHouseholdAsync(currentUser.UserId!.Value, request.Name, ct);
                return Results.Ok(new { household.Id, household.Name });
            }).RequireAntiforgeryValidation();

            app.MapGet("/api/households/mine", async (ICurrentUserAccessor currentUser, HouseholdFacade householdFacade, CancellationToken ct) =>
            {
                var results = await householdFacade.GetMyHouseholdsAsync(currentUser.UserId!.Value, ct);
                return Results.Ok(results.Select(r => MyHouseholdDto.From(r.Household, r.Role)));
            });

            // Combines Finance's membership rows with each member's Identity
            // display name/email — Web is the one layer allowed to know about
            // both.
            app.MapGet("/api/households/{householdId:guid}/members", async (
                Guid householdId,
                ICurrentUserAccessor currentUser,
                HouseholdFacade householdFacade,
                IUserRepository userRepository,
                CancellationToken ct) =>
            {
                try
                {
                    var members = await householdFacade.GetMembersAsync(currentUser.UserId!.Value, householdId, ct);
                    var result = new List<HouseholdMemberDto>();
                    foreach (var member in members)
                    {
                        var user = await userRepository.GetByIdAsync(member.UserId, ct);
                        if (user is not null) result.Add(HouseholdMemberDto.From(member.UserId, user.DisplayName, user.Email, member.Role));
                    }
                    return Results.Ok(result);
                }
                catch (NotHouseholdMemberException)
                {
                    return Results.Forbid();
                }
            });

            // Owner-only (enforced inside HouseholdFacade). Looks up whether the
            // invited email already belongs to a User (IAmFara.Web is the one
            // layer allowed to know about both Identity and Finance) — an
            // existing user only needs a finance.HouseholdInvitations row; a new
            // one also needs an identity.Invitations row, linked, so the new-user
            // passkey ceremony above can auto-join this household on completion.
            app.MapPost("/api/households/{householdId:guid}/invitations", async (
                Guid householdId,
                ICurrentUserAccessor currentUser,
                HouseholdFacade householdFacade,
                IUserRepository userRepository,
                InvitationService invitationService,
                CreateHouseholdInvitationRequest request,
                CancellationToken ct) =>
            {
                try
                {
                    var existingUser = await userRepository.GetByEmailAsync(request.Email, ct);
                    Guid? identityInvitationId = null;
                    string? identityRawToken = null;
                    if (existingUser is null)
                    {
                        var (identityInvitation, rawToken) = await invitationService.CreateAsync(request.Email, currentUser.UserId, ct);
                        identityInvitationId = identityInvitation.Id;
                        identityRawToken = rawToken;
                    }

                    var (_, householdRawToken) = await householdFacade.CreateInvitationAsync(
                        currentUser.UserId!.Value, householdId, RoleFromString(request.Role), identityInvitationId, ct);

                    // The recipient only ever needs one link: the identity token
                    // (which starts account creation and auto-joins this household
                    // on completion) for a new user, or the household token
                    // directly for an existing one.
                    return Results.Ok(new { token = identityRawToken ?? householdRawToken });
                }
                catch (Exception ex) when (ex is NotHouseholdOwnerException or ArgumentException)
                {
                    if (ex is NotHouseholdOwnerException) return Results.Forbid();
                    return Results.BadRequest(new { error = ex.Message });
                }
            }).RequireAntiforgeryValidation();

            // An existing, already-signed-in user redeeming a household
            // invitation they received.
            app.MapPost("/api/households/invitations/consume", async (
                ICurrentUserAccessor currentUser,
                HouseholdFacade householdFacade,
                ConsumeHouseholdInvitationRequest request,
                CancellationToken ct) =>
            {
                try
                {
                    var membership = await householdFacade.ConsumeInvitationAsync(currentUser.UserId!.Value, request.Token, ct);
                    return Results.Ok(new { membership.HouseholdId, membership.Role });
                }
                catch (InvitationInvalidException ex)
                {
                    return Results.BadRequest(new { error = ex.Message });
                }
            }).RequireAntiforgeryValidation();

            app.MapDelete("/api/households/{householdId:guid}/members/{membershipId:guid}", async (
                Guid householdId,
                Guid membershipId,
                ICurrentUserAccessor currentUser,
                HouseholdFacade householdFacade,
                CancellationToken ct) =>
            {
                try
                {
                    await householdFacade.RemoveMemberAsync(currentUser.UserId!.Value, householdId, membershipId, ct);
                    return Results.Ok();
                }
                catch (NotHouseholdOwnerException)
                {
                    return Results.Forbid();
                }
                catch (CannotRemoveLastOwnerException ex)
                {
                    return Results.BadRequest(new { error = ex.Message });
                }
                catch (KeyNotFoundException)
                {
                    return Results.NotFound();
                }
            }).RequireAntiforgeryValidation();

            // ---- Finance HTTP API ----
            // Household-scoped: every route carries {householdId}, and every
            // handler re-derives the acting user from ICurrentUserAccessor —
            // FinanceFacade itself re-checks HouseholdMembership before doing
            // anything, so this is defense in depth, not the only check.

            app.MapGet("/api/households/{householdId:guid}/transactions", async (
                Guid householdId,
                ICurrentUserAccessor currentUser,
                FinanceFacade finance,
                DateOnly? fromDate,
                DateOnly? toDate,
                Guid? categoryId,
                string? type,
                CancellationToken ct) =>
            {
                try
                {
                    var filter = new TransactionFilter(fromDate, toDate, categoryId, type is null ? null : TypeFromString(type));
                    var results = await finance.GetTransactionsAsync(currentUser.UserId!.Value, householdId, filter, ct);
                    return Results.Ok(results.Select(TransactionDto.From));
                }
                catch (Exception ex) when (ex is NotHouseholdMemberException or ArgumentException)
                {
                    return MapFinanceException(ex);
                }
            });

            app.MapGet("/api/households/{householdId:guid}/transactions/{id:guid}", async (
                Guid householdId, Guid id, ICurrentUserAccessor currentUser, FinanceFacade finance, CancellationToken ct) =>
            {
                try
                {
                    var transaction = await finance.GetTransactionAsync(currentUser.UserId!.Value, householdId, id, ct);
                    return transaction is null ? Results.NotFound() : Results.Ok(TransactionDto.From(transaction));
                }
                catch (NotHouseholdMemberException ex)
                {
                    return MapFinanceException(ex);
                }
            });

            app.MapPost("/api/households/{householdId:guid}/transactions", async (
                Guid householdId, ICurrentUserAccessor currentUser, FinanceFacade finance, CreateTransactionRequest request, CancellationToken ct) =>
            {
                try
                {
                    var transaction = await finance.AddTransactionAsync(
                        currentUser.UserId!.Value, householdId, TypeFromString(request.Type), request.AmountMinor, DateFromString(request.Date),
                        Guid.Parse(request.CategoryId), request.Note, request.FixedExpenseId is null ? null : Guid.Parse(request.FixedExpenseId), ct);
                    return Results.Ok(TransactionDto.From(transaction));
                }
                catch (Exception ex) when (ex is NotHouseholdMemberException or ArgumentException or FormatException)
                {
                    return MapFinanceException(ex);
                }
            }).RequireAntiforgeryValidation();

            app.MapPatch("/api/households/{householdId:guid}/transactions/{id:guid}", async (
                Guid householdId, Guid id, ICurrentUserAccessor currentUser, FinanceFacade finance, UpdateTransactionRequest request, CancellationToken ct) =>
            {
                try
                {
                    var transaction = await finance.UpdateTransactionAsync(currentUser.UserId!.Value, householdId, id, t =>
                    {
                        if (request.Type is not null) t.Type = TypeFromString(request.Type);
                        if (request.AmountMinor is not null) t.AmountMinor = request.AmountMinor.Value;
                        if (request.Date is not null) t.Date = DateFromString(request.Date);
                        if (request.CategoryId is not null) t.CategoryId = Guid.Parse(request.CategoryId);
                        if (request.Note is not null) t.Note = request.Note;
                    }, ct);
                    return Results.Ok(TransactionDto.From(transaction));
                }
                catch (Exception ex) when (ex is NotHouseholdMemberException or KeyNotFoundException or ArgumentException or FormatException)
                {
                    return MapFinanceException(ex);
                }
            }).RequireAntiforgeryValidation();

            app.MapDelete("/api/households/{householdId:guid}/transactions/{id:guid}", async (
                Guid householdId, Guid id, ICurrentUserAccessor currentUser, FinanceFacade finance, CancellationToken ct) =>
            {
                try
                {
                    await finance.DeleteTransactionAsync(currentUser.UserId!.Value, householdId, id, ct);
                    return Results.Ok();
                }
                catch (NotHouseholdMemberException ex)
                {
                    return MapFinanceException(ex);
                }
            }).RequireAntiforgeryValidation();

            app.MapGet("/api/households/{householdId:guid}/categories", async (
                Guid householdId, ICurrentUserAccessor currentUser, FinanceFacade finance, CancellationToken ct) =>
            {
                try
                {
                    var results = await finance.GetCategoriesAsync(currentUser.UserId!.Value, householdId, ct);
                    return Results.Ok(results.Select(CategoryDto.From));
                }
                catch (NotHouseholdMemberException ex)
                {
                    return MapFinanceException(ex);
                }
            });

            app.MapPost("/api/households/{householdId:guid}/categories", async (
                Guid householdId, ICurrentUserAccessor currentUser, FinanceFacade finance, CreateCategoryRequest request, CancellationToken ct) =>
            {
                try
                {
                    var category = await finance.AddCategoryAsync(currentUser.UserId!.Value, householdId, TypeFromString(request.Type), request.Name ?? "", ct);
                    return Results.Ok(CategoryDto.From(category));
                }
                catch (Exception ex) when (ex is NotHouseholdMemberException or ArgumentException)
                {
                    return MapFinanceException(ex);
                }
            }).RequireAntiforgeryValidation();

            app.MapPatch("/api/households/{householdId:guid}/categories/{id:guid}", async (
                Guid householdId, Guid id, ICurrentUserAccessor currentUser, FinanceFacade finance, UpdateCategoryRequest request, CancellationToken ct) =>
            {
                try
                {
                    var category = await finance.UpdateCategoryAsync(currentUser.UserId!.Value, householdId, id, request.Name ?? "", ct);
                    return Results.Ok(CategoryDto.From(category));
                }
                catch (Exception ex) when (ex is NotHouseholdMemberException or KeyNotFoundException)
                {
                    return MapFinanceException(ex);
                }
            }).RequireAntiforgeryValidation();

            app.MapDelete("/api/households/{householdId:guid}/categories/{id:guid}", async (
                Guid householdId, Guid id, ICurrentUserAccessor currentUser, FinanceFacade finance, CancellationToken ct) =>
            {
                try
                {
                    await finance.DeleteCategoryAsync(currentUser.UserId!.Value, householdId, id, ct);
                    return Results.Ok();
                }
                catch (Exception ex) when (ex is NotHouseholdMemberException or CategoryInUseException)
                {
                    return MapFinanceException(ex);
                }
            }).RequireAntiforgeryValidation();

            app.MapGet("/api/households/{householdId:guid}/fixed-expenses", async (
                Guid householdId, ICurrentUserAccessor currentUser, FinanceFacade finance, bool includeInactive, CancellationToken ct) =>
            {
                try
                {
                    var results = await finance.GetFixedExpensesAsync(currentUser.UserId!.Value, householdId, includeInactive, ct);
                    return Results.Ok(results.Select(FixedMonthlyExpenseDto.From));
                }
                catch (NotHouseholdMemberException ex)
                {
                    return MapFinanceException(ex);
                }
            });

            app.MapPost("/api/households/{householdId:guid}/fixed-expenses", async (
                Guid householdId, ICurrentUserAccessor currentUser, FinanceFacade finance, CreateFixedExpenseRequest request, CancellationToken ct) =>
            {
                try
                {
                    var expense = await finance.AddFixedExpenseAsync(
                        currentUser.UserId!.Value, householdId, request.Name, Guid.Parse(request.CategoryId), request.DefaultAmountMinor, request.DueDay, ct);
                    return Results.Ok(FixedMonthlyExpenseDto.From(expense));
                }
                catch (Exception ex) when (ex is NotHouseholdMemberException or FormatException)
                {
                    return MapFinanceException(ex);
                }
            }).RequireAntiforgeryValidation();

            app.MapPatch("/api/households/{householdId:guid}/fixed-expenses/{id:guid}", async (
                Guid householdId, Guid id, ICurrentUserAccessor currentUser, FinanceFacade finance, UpdateFixedExpenseRequest request, CancellationToken ct) =>
            {
                try
                {
                    var expense = await finance.UpdateFixedExpenseAsync(currentUser.UserId!.Value, householdId, id, e =>
                    {
                        if (request.Name is not null) e.Name = request.Name;
                        if (request.CategoryId is not null) e.CategoryId = Guid.Parse(request.CategoryId);
                        if (request.DefaultAmountMinor is not null) e.DefaultAmountMinor = request.DefaultAmountMinor.Value;
                        if (request.DueDay is not null) e.DueDay = request.DueDay;
                    }, ct);
                    return Results.Ok(FixedMonthlyExpenseDto.From(expense));
                }
                catch (Exception ex) when (ex is NotHouseholdMemberException or KeyNotFoundException or FormatException)
                {
                    return MapFinanceException(ex);
                }
            }).RequireAntiforgeryValidation();

            app.MapPost("/api/households/{householdId:guid}/fixed-expenses/{id:guid}/archive", async (
                Guid householdId, Guid id, ICurrentUserAccessor currentUser, FinanceFacade finance, CancellationToken ct) =>
            {
                try
                {
                    await finance.SetFixedExpenseActiveAsync(currentUser.UserId!.Value, householdId, id, isActive: false, ct);
                    return Results.Ok();
                }
                catch (Exception ex) when (ex is NotHouseholdMemberException or KeyNotFoundException)
                {
                    return MapFinanceException(ex);
                }
            }).RequireAntiforgeryValidation();

            app.MapPost("/api/households/{householdId:guid}/fixed-expenses/{id:guid}/restore", async (
                Guid householdId, Guid id, ICurrentUserAccessor currentUser, FinanceFacade finance, CancellationToken ct) =>
            {
                try
                {
                    await finance.SetFixedExpenseActiveAsync(currentUser.UserId!.Value, householdId, id, isActive: true, ct);
                    return Results.Ok();
                }
                catch (Exception ex) when (ex is NotHouseholdMemberException or KeyNotFoundException)
                {
                    return MapFinanceException(ex);
                }
            }).RequireAntiforgeryValidation();

            app.MapPost("/api/households/{householdId:guid}/fixed-expenses/{id:guid}/mark-paid", async (
                Guid householdId, Guid id, ICurrentUserAccessor currentUser, FinanceFacade finance, MarkFixedExpensePaidRequest request, CancellationToken ct) =>
            {
                try
                {
                    var transaction = await finance.MarkFixedExpensePaidAsync(
                        currentUser.UserId!.Value, householdId, id, DateFromString(request.FromDate), DateFromString(request.ToDate),
                        request.AmountMinor, DateFromString(request.Date), ct);
                    return Results.Ok(TransactionDto.From(transaction));
                }
                catch (Exception ex) when (ex is NotHouseholdMemberException or KeyNotFoundException or FormatException)
                {
                    return MapFinanceException(ex);
                }
            }).RequireAntiforgeryValidation();

            app.MapPost("/api/households/{householdId:guid}/fixed-expenses/{id:guid}/mark-unpaid", async (
                Guid householdId, Guid id, ICurrentUserAccessor currentUser, FinanceFacade finance, MarkFixedExpenseUnpaidRequest request, CancellationToken ct) =>
            {
                try
                {
                    await finance.MarkFixedExpenseUnpaidAsync(currentUser.UserId!.Value, householdId, id, DateFromString(request.FromDate), DateFromString(request.ToDate), ct);
                    return Results.Ok();
                }
                catch (Exception ex) when (ex is NotHouseholdMemberException or FormatException)
                {
                    return MapFinanceException(ex);
                }
            }).RequireAntiforgeryValidation();

            app.MapGet("/api/households/{householdId:guid}/period-overrides", async (
                Guid householdId, string periodId, ICurrentUserAccessor currentUser, FinanceFacade finance, CancellationToken ct) =>
            {
                try
                {
                    var results = await finance.GetPeriodOverridesAsync(currentUser.UserId!.Value, householdId, periodId, ct);
                    return Results.Ok(results.Select(FixedExpensePeriodOverrideDto.From));
                }
                catch (NotHouseholdMemberException ex)
                {
                    return MapFinanceException(ex);
                }
            });

            app.MapPut("/api/households/{householdId:guid}/fixed-expenses/{fixedExpenseId:guid}/period-overrides/{periodId}", async (
                Guid householdId, Guid fixedExpenseId, string periodId, ICurrentUserAccessor currentUser, FinanceFacade finance, SetPeriodOverrideRequest request, CancellationToken ct) =>
            {
                try
                {
                    await finance.SetPeriodOverrideAsync(currentUser.UserId!.Value, householdId, fixedExpenseId, periodId, request.AmountMinor, ct);
                    return Results.Ok();
                }
                catch (Exception ex) when (ex is NotHouseholdMemberException or InvalidOperationException)
                {
                    return Results.BadRequest(new { error = ex.Message });
                }
            }).RequireAntiforgeryValidation();

            app.MapDelete("/api/households/{householdId:guid}/fixed-expenses/{fixedExpenseId:guid}/period-overrides/{periodId}", async (
                Guid householdId, Guid fixedExpenseId, string periodId, ICurrentUserAccessor currentUser, FinanceFacade finance, CancellationToken ct) =>
            {
                try
                {
                    await finance.ClearPeriodOverrideAsync(currentUser.UserId!.Value, householdId, fixedExpenseId, periodId, ct);
                    return Results.Ok();
                }
                catch (NotHouseholdMemberException ex)
                {
                    return MapFinanceException(ex);
                }
            }).RequireAntiforgeryValidation();

            app.MapGet("/api/households/{householdId:guid}/settings", async (
                Guid householdId, ICurrentUserAccessor currentUser, FinanceFacade finance, CancellationToken ct) =>
            {
                try
                {
                    var settings = await finance.GetSettingsAsync(currentUser.UserId!.Value, householdId, ct);
                    return Results.Ok(FinanceSettingsDto.From(settings));
                }
                catch (NotHouseholdMemberException ex)
                {
                    return MapFinanceException(ex);
                }
            });

            app.MapPatch("/api/households/{householdId:guid}/settings", async (
                Guid householdId, ICurrentUserAccessor currentUser, FinanceFacade finance, UpdateFinanceSettingsRequest request, CancellationToken ct) =>
            {
                try
                {
                    var current = await finance.GetSettingsAsync(currentUser.UserId!.Value, householdId, ct);
                    var settings = await finance.UpdateSettingsAsync(
                        currentUser.UserId!.Value, householdId, request.FinancialPeriodStartDay ?? current.FinancialPeriodStartDay, ct);
                    return Results.Ok(FinanceSettingsDto.From(settings));
                }
                catch (NotHouseholdMemberException ex)
                {
                    return MapFinanceException(ex);
                }
            }).RequireAntiforgeryValidation();

            // The finance app (/expenses/demo) needs iOS's apple-mobile-web-app-*
            // meta tags present before React runs, which the shared index.html
            // can't carry unconditionally — see vite.config.ts's financeAppHtml
            // plugin, which builds expenses-demo.html (index.html plus those
            // tags) as its own artifact, also used by the service worker's own
            // offline navigateFallback so online/offline launches match. More
            // specific fallback patterns take precedence over the general one
            // below, regardless of registration order.
            app.MapFallbackToFile("/expenses/demo", "expenses-demo.html").AllowAnonymous();
            app.MapFallbackToFile("/expenses/demo/{**path}", "expenses-demo.html").AllowAnonymous();
            app.MapFallbackToFile("index.html").AllowAnonymous();

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

        /// <summary>Shared error mapping for the household-scoped Finance endpoints below.</summary>
        private static IResult MapFinanceException(Exception ex) => ex switch
        {
            NotHouseholdMemberException => Results.Forbid(),
            KeyNotFoundException => Results.NotFound(),
            CategoryInUseException cie => Results.Conflict(new { error = cie.Message, categoryId = cie.CategoryId, transactionCount = cie.TransactionCount }),
            ArgumentException or FormatException => Results.BadRequest(new { error = ex.Message }),
            _ => throw ex,
        };
    }
}
