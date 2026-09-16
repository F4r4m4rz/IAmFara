using IAmFara.Web.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace IAmFara.Web.Data;

public class AnalyticsDbContext(DbContextOptions<AnalyticsDbContext> options) : DbContext(options)
{
    public DbSet<AnalyticsVisit> Visits => Set<AnalyticsVisit>();
    public DbSet<AnalyticsDailySummary> DailySummaries => Set<AnalyticsDailySummary>();
    public DbSet<AnalyticsDailyCountryBreakdown> DailyCountryBreakdowns => Set<AnalyticsDailyCountryBreakdown>();
    public DbSet<AnalyticsDailyPageBreakdown> DailyPageBreakdowns => Set<AnalyticsDailyPageBreakdown>();
    public DbSet<AnalyticsReportRun> ReportRuns => Set<AnalyticsReportRun>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AnalyticsVisit>(entity =>
        {
            entity.HasKey(v => v.Id);
            entity.Property(v => v.CountryCode).HasMaxLength(2).IsFixedLength();
            entity.Property(v => v.NormalizedPath).HasMaxLength(200);
            entity.Property(v => v.DailyVisitorKey).HasMaxLength(64).IsFixedLength();

            entity.HasIndex(v => v.OccurredAtUtc);
            entity.HasIndex(v => new { v.OccurredAtUtc, v.CountryCode });
            entity.HasIndex(v => new { v.OccurredAtUtc, v.NormalizedPath });
            entity.HasIndex(v => new { v.OccurredAtUtc, v.DailyVisitorKey });
        });

        modelBuilder.Entity<AnalyticsDailySummary>(entity =>
        {
            entity.HasKey(s => s.LocalDate);
        });

        modelBuilder.Entity<AnalyticsDailyCountryBreakdown>(entity =>
        {
            entity.HasKey(c => new { c.LocalDate, c.CountryCode });
            entity.Property(c => c.CountryCode).HasMaxLength(2).IsFixedLength();
        });

        modelBuilder.Entity<AnalyticsDailyPageBreakdown>(entity =>
        {
            entity.HasKey(p => new { p.LocalDate, p.NormalizedPath });
            entity.Property(p => p.NormalizedPath).HasMaxLength(200);
        });

        modelBuilder.Entity<AnalyticsReportRun>(entity =>
        {
            entity.HasKey(r => r.ReportDate);
            entity.Property(r => r.Status).HasConversion<string>().HasMaxLength(20);
            entity.Property(r => r.ResendMessageId).HasMaxLength(100);
            entity.Property(r => r.ErrorMessage).HasMaxLength(500);
        });
    }
}
