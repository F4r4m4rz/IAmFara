# Visitor analytics & daily email report

Privacy-conscious page-view analytics for iamfara.com, aggregated once a day
and emailed as a summary. This document covers the architecture, the exact
metric definitions, how to set up and migrate the database, every
configuration key involved, local development, SmarterASP.NET deployment,
retention/cleanup behavior, and how to safely trigger a one-off test report.

## Architecture

```
Browser (React SPA)
  └─ useTrackPageView() fires on first load + every client-side route change
       └─ POST /api/analytics/visit (same-origin, public, rate-limited)
            └─ ASP.NET Core backend
                 ├─ bot / path filtering
                 ├─ local GeoIP (.mmdb) lookup → country code, raw IP discarded
                 ├─ daily-rotating HMAC-SHA256 visitor key
                 └─ writes one AnalyticsVisit row (SQL Server via EF Core)

GitHub Actions (cron, 02:00 UTC daily)
  └─ POST /api/analytics/report/run  (Authorization: Bearer <secret>)
       └─ AnalyticsReportService
            ├─ computes yesterday's (Europe/Oslo) aggregates from AnalyticsVisit
            ├─ upserts AnalyticsDailySummary / …CountryBreakdown / …PageBreakdown
            ├─ sends one HTML+text email via the Resend API
            ├─ records an AnalyticsReportRun row (idempotency marker)
            └─ deletes AnalyticsVisit rows older than the retention window
```

Only the very first page load of a React Router SPA hits the server — every
later in-app navigation is pure client-side routing. `useTrackPageView`
(`src/frontend/src/analytics/useTrackPageView.ts`) closes that gap by firing a
`navigator.sendBeacon` (falling back to `fetch(..., { keepalive: true })`) on
every `location.pathname` change, covering first load and later navigation
with one code path.

The report is triggered by an **external** scheduler (GitHub Actions), not an
in-process timer — SmarterASP.NET's shared hosting can recycle or sleep the
app pool at any time, so nothing running only inside the process can be
trusted to fire on schedule. The HTTPS call itself wakes the app if needed.

## Metric definitions

- **Page view**: one recorded, successfully validated navigation to an
  in-app path (first document load or a client-side route change). Bot
  traffic (by User-Agent heuristic) and invalid/oversized paths are excluded
  before anything is written.
- **Approximate unique visitors**: the count of distinct daily visitor keys
  (see Privacy design) seen that day. This is an approximation, not an exact
  count of people — see Accuracy limitations below.
- **Reporting day**: the previous calendar day in **Europe/Oslo**, computed
  from UTC timestamps at report time (`OsloClock.PreviousOsloDate`). All
  timestamps are stored in UTC; Oslo-local boundaries (including DST
  transitions) are only ever computed at read/report time.
- **Country**: ISO 3166-1 alpha-2, or `"XX"` (shown as "Unknown" in the
  report) when it can't be determined.

### Accuracy limitations

- The unique-visitor count is a **coarse approximation**: the same person can
  count as more than one "unique visitor" if their IP changes intra-day, and
  different people can collapse into the same key if they share a /24 (IPv4)
  or /64 (IPv6) subnet, a daily-rotating HMAC key, *and* the same coarse
  browser bucket (e.g. two people on the same corporate NAT both using
  Chrome/Windows). This is an intentional trade-off for not storing anything
  IP-derived beyond a rotating, non-reversible hash.
- GeoIP-based country lookups are inherently approximate (VPNs, mobile
  carrier NAT, database staleness between monthly DB-IP updates).
- Bot filtering is a best-effort User-Agent substring check, not real bot
  detection — some automated traffic will still be counted, and simple
  crawlers that never execute JavaScript never call the endpoint at all
  (which incidentally filters a lot of noise for free).

## Privacy design

1. Request arrives at `POST /api/analytics/visit` with `RemoteIpAddress`
   available from the connection (never trusted from `X-Forwarded-For`,
   which isn't read anywhere in this feature).
2. The IP is looked up in the local GeoIP database → country code (or `XX`
   on any failure) — `Services/GeoIpService.cs`.
3. The IP is truncated to a /24 (IPv4) or /64 (IPv6) network prefix —
   `Services/IpNormalizer.cs`.
4. The User-Agent is reduced to a coarse bucket like `Chrome-Windows` or
   `Safari-iOS` — `Services/BrowserBucket.cs`. The full User-Agent is never
   stored.
5. `HMAC-SHA256(VisitorHmacKey, normalizedIp|browserBucket|osloDate)` is
   computed — `Services/VisitorKeyService.cs`. The Oslo-local date is part of
   the HMAC input, so the key **rotates every calendar day by construction**;
   the same person visiting on two different days always gets two different
   keys.
6. **The raw IP address and full User-Agent are discarded immediately** —
   neither is ever written to the database or logged. Only
   `{OccurredAtUtc, CountryCode, NormalizedPath, DailyVisitorKey}` is
   persisted (`AnalyticsVisit`).
7. Detailed `AnalyticsVisit` rows are deleted after **30 days** (see
   Retention below); the daily aggregate tables are kept indefinitely (they
   hold only a handful of small rows per day, with no IP-derived data at
   all).

`VisitorHmacKey` is a production secret (see Configuration below) — anyone
who obtains it and today's date could recompute keys for guessed IPs, so it's
never committed, logged, or exposed through any endpoint.

## Data model

| Table | Retention | Purpose |
|---|---|---|
| `AnalyticsVisit` | 30 days | One row per recorded page view |
| `AnalyticsDailySummary` | forever | Daily totals: page views, unique visitors |
| `AnalyticsDailyCountryBreakdown` | forever | Daily totals per country |
| `AnalyticsDailyPageBreakdown` | forever | Daily totals per path (top pages, capped at 10/day) |
| `AnalyticsReportRun` | forever | One row per reporting date — idempotency marker for the email job |

Aggregates are computed **once per day**, by the report job itself, from the
raw `AnalyticsVisit` rows for that Oslo day — not incrementally on every
visit. This avoids any concurrent-update races on aggregate counters (no
atomic increments, no locking) at the cost of a bit more read work once a
day, which is the right trade for a low-traffic personal site.

## Database setup & migration

The databases already exist for both the `devtest` and `prod` environments,
each with its connection string saved as an App Pool environment variable
named `DbConnectionString` on the respective SmarterASP.NET site — the app
reads it directly via `builder.Configuration["DbConnectionString"]`, no
further setup needed there.

**Schema changes are never auto-applied to production.** EF Core migrations
live in `src/backend/IAmFara.Web/Data/Migrations/`, and an idempotent SQL
script is generated alongside them:

```
src/backend/IAmFara.Web/Data/Migrations/Scripts/InitialCreate.idempotent.sql
```

To apply the current schema (or any future migration) to a database:

1. Regenerate the script after adding a new migration:
   ```bash
   cd src/backend/IAmFara.Web
   dotnet ef migrations script --context AnalyticsDbContext --idempotent \
     -o Data/Migrations/Scripts/<MigrationName>.idempotent.sql
   ```
2. Review the generated SQL.
3. Run it yourself via the SmarterASP.NET control panel's SQL query tool,
   once against `devtest`, then once against `prod`. The script is
   idempotent (checks `__EFMigrationsHistory` before each step), so re-running
   it is always safe.

To add a new migration during future development:

```bash
cd src/backend/IAmFara.Web
dotnet ef migrations add <MigrationName> --context AnalyticsDbContext -o Data/Migrations
```

## Configuration keys

None of these have real values committed anywhere — `appsettings.json` only
holds empty placeholders. Actual values are supplied per-environment as
described below.

| Key | Purpose | How it's supplied |
|---|---|---|
| `DbConnectionString` | SQL Server connection string | SmarterASP.NET App Pool environment variable (flat key, both prod and devtest) |
| `Analytics:VisitorHmacKey` | HMAC key for the daily-rotating visitor identifier | SmarterASP.NET App Pool environment variable `Analytics__VisitorHmacKey` (double underscore — binds to the nested config key) |
| `Analytics:ReportToEmail` | Recipient address for the daily report | `appsettings.json` (non-secret) or an env var override if you'd rather not commit it |
| `Analytics:ReportSecret` | Bearer secret required to call `/api/analytics/report/run` | SmarterASP.NET App Pool environment variable `Analytics__ReportSecret` **and** the GitHub Actions repo secret `ANALYTICS_REPORT_SECRET` — must be the exact same value |
| `Resend:ApiKey` | Resend API key (reused from the contact form) | SmarterASP.NET App Pool environment variable `Email_ApiKey` (already set up) |
| `Resend:FromEmail` | Sender address (reused from the contact form) | Already delivered via CI (`WebConfigEnvironmentVariables`) |

### Local development

Never put real secrets in `appsettings.Development.json` (it's committed).
Use the .NET user-secrets store instead:

```bash
cd src/backend/IAmFara.Web
dotnet user-secrets set "DbConnectionString" "<your local/dev SQL Server connection string>"
dotnet user-secrets set "Analytics:VisitorHmacKey" "<any random string for local testing>"
dotnet user-secrets set "Analytics:ReportSecret" "<any random string for local testing>"
dotnet user-secrets set "Analytics:ReportToEmail" "you@example.com"
dotnet user-secrets set "Resend:ApiKey" "<your Resend API key, or leave unset to skip real sends>"
dotnet user-secrets set "Resend:FromEmail" "onboarding@resend.dev"
```

If `Resend:ApiKey`/`FromEmail`/`Analytics:ReportToEmail` are left unset, the
report endpoint returns a `503` problem response instead of trying (and
failing) to call Resend — page-view recording is unaffected either way.

A local SQL Server (or LocalDB) is required for `AnalyticsDbContext` to work;
apply the idempotent script above against it, or run
`dotnet ef database update --context AnalyticsDbContext` for local iteration
(never do this against prod/devtest).

## SmarterASP.NET deployment & scheduler setup

No changes were needed to the existing deploy workflows
(`.github/workflows/deploy-test.yml` / `deploy-prod.yml`) — `DbConnectionString`
and the two `Analytics__*` secrets all follow the same App-Pool-environment-
variable pattern already used for `Email_ApiKey`, so they're independent of
what any given CI deploy does.

The daily report is triggered by `.github/workflows/analytics-report.yml`, a
GitHub Actions scheduled workflow (`cron: "0 2 * * *"`, 02:00 UTC daily) that
calls `POST https://iamfara.com/api/analytics/report/run` with an
`Authorization: Bearer <ANALYTICS_REPORT_SECRET>` header. 02:00 UTC is
comfortably after midnight in Europe/Oslo year-round (01:00 CET in winter,
02:00 CEST in summer), so "yesterday" is always complete by the time it
fires — no dual DST-aware schedule is needed. The endpoint's own idempotency
check (`AnalyticsReportRun`, keyed by Oslo reporting date) is the actual
correctness guarantee: a late run, a manual re-run, or a GitHub Actions retry
for the same day is always a safe no-op instead of a duplicate email.

The workflow can also be triggered manually from the Actions tab
(`workflow_dispatch`) — see "Triggering a test report" below.

SmarterASP.NET's "Always On" setting is **not required** by this design —
the trigger is an external HTTPS call, which wakes a sleeping app pool on
its own.

## Retention & cleanup

`AnalyticsVisit` rows older than **30 days** (relative to each report run's
reporting date) are deleted at the end of every successful report run
(`AnalyticsReportService.CleanupOldVisitsAsync`). The three daily aggregate
tables and `AnalyticsReportRun` are never deleted — they're small (a
handful of rows per day) and contain no IP-derived data.

## Troubleshooting

- **A visit isn't showing up**: check whether the User-Agent looks like a
  bot (`Services/BotFilter.cs`) or the path failed validation
  (`Services/PathNormalizer.cs`) — both cases return `200 OK` from
  `/api/analytics/visit` without writing a row, by design (the endpoint never
  surfaces failures to the visitor).
- **Country is always "Unknown"**: confirm
  `src/backend/IAmFara.Web/GeoIP/dbip-country-lite.mmdb` was actually
  published (check the app's file system via a diagnostic, or redeploy) —
  `GeoIpService` logs a warning (no personal data) if it can't load the file,
  and always falls back to `"XX"` rather than failing the request.
- **The report endpoint returns 401**: the `Authorization: Bearer` value
  doesn't match `Analytics:ReportSecret` — re-check the SmarterASP.NET App
  Pool env var and the GitHub Actions secret are byte-for-byte identical
  (no extra whitespace/newline).
- **The report endpoint returns 503**: `Resend:ApiKey` / `Resend:FromEmail` /
  `Analytics:ReportToEmail` aren't fully configured on that environment.
- **A report run failed partway**: check the `AnalyticsReportRun` row for
  that date — a `Failed` status with `ErrorMessage` records what went wrong;
  retrying is always safe (see idempotency above) once the underlying issue
  is fixed.

### `dbip-country-lite.mmdb` refresh process

DB-IP publishes a new Country Lite build monthly (CC BY 4.0, attribution
included in the report email footer). To refresh it:

```bash
curl -LO https://download.db-ip.com/free/dbip-country-lite-$(date +%Y-%m).mmdb.gz
gunzip dbip-country-lite-*.mmdb.gz
mv dbip-country-lite-*.mmdb src/backend/IAmFara.Web/GeoIP/dbip-country-lite.mmdb
```

Commit the replaced file and deploy as usual. This is a manual, occasional
task — no scheduled automation for it exists yet.

### Triggering a test report safely

To send a real report for a specific (past) date without waiting for the
schedule, without ever pasting the secret into chat or a script that gets
committed:

```bash
curl -X POST "https://iamfara.com/api/analytics/report/run" \
  -H "Authorization: Bearer $ANALYTICS_REPORT_SECRET"
```

(export `ANALYTICS_REPORT_SECRET` in your own shell first — never inline it
in a command you might paste elsewhere). The response tells you whether it
was `sent` or `already-sent` for "yesterday" (Oslo). There is currently no
way to request an arbitrary historical date through the endpoint itself —
it always reports on the previous Oslo day relative to when it's called.

You can also trigger the GitHub Actions workflow manually from the repo's
Actions tab (`Send daily visitor analytics report` → "Run workflow") instead
of calling curl directly.
