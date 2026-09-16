using Microsoft.EntityFrameworkCore;

namespace IAmFara.Web.Data;

/// <summary>
/// Intentionally empty for now — this lands on its own to prove the EF Core +
/// SQL Server + migrations + CI pipeline works end to end (package
/// versions, connection string wiring, the manual "Run database migrations"
/// GitHub Actions workflow) before any real tables are introduced. The
/// visitor-analytics feature branch adds the actual DbSets/entities on top
/// of this via its own migration.
/// </summary>
public class AnalyticsDbContext(DbContextOptions<AnalyticsDbContext> options) : DbContext(options)
{
}
