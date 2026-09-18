using IAmFara.Data.Abstractions.Finance;
using Microsoft.EntityFrameworkCore;

namespace IAmFara.Data.SqlServer.Finance;

public class FinanceDbContext(DbContextOptions<FinanceDbContext> options) : DbContext(options)
{
    public DbSet<Household> Households => Set<Household>();
    public DbSet<HouseholdMembership> HouseholdMemberships => Set<HouseholdMembership>();
    public DbSet<HouseholdInvitation> HouseholdInvitations => Set<HouseholdInvitation>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<FixedMonthlyExpense> FixedMonthlyExpenses => Set<FixedMonthlyExpense>();
    public DbSet<FixedExpensePeriodOverride> FixedExpensePeriodOverrides => Set<FixedExpensePeriodOverride>();
    public DbSet<FinancialPeriodSettings> FinancialPeriodSettings => Set<FinancialPeriodSettings>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("finance");

        modelBuilder.Entity<Household>(entity =>
        {
            entity.ToTable("Households");
            entity.HasKey(h => h.Id);
            entity.Property(h => h.Name).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<HouseholdMembership>(entity =>
        {
            entity.ToTable("HouseholdMemberships");
            entity.HasKey(m => m.Id);
            entity.Property(m => m.Role).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(m => new { m.UserId, m.HouseholdId }).IsUnique();
            entity.HasIndex(m => m.HouseholdId);

            // Every household-owned aggregate cascades when its Household is deleted —
            // deleting a household is meant to remove everything inside it.
            entity.HasOne<Household>()
                .WithMany()
                .HasForeignKey(m => m.HouseholdId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<HouseholdInvitation>(entity =>
        {
            entity.ToTable("HouseholdInvitations");
            entity.HasKey(i => i.Id);
            entity.Property(i => i.Role).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(i => i.TokenHash).IsUnique();
            entity.HasIndex(i => i.HouseholdId);

            entity.HasOne<Household>()
                .WithMany()
                .HasForeignKey(i => i.HouseholdId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.ToTable("Categories");
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Type).HasConversion<string>().HasMaxLength(20);
            entity.Property(c => c.LabelKey).HasMaxLength(100);
            entity.Property(c => c.Name).HasMaxLength(200);
            entity.HasIndex(c => c.HouseholdId);

            entity.HasOne<Household>()
                .WithMany()
                .HasForeignKey(c => c.HouseholdId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.ToTable("Transactions");
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Type).HasConversion<string>().HasMaxLength(20);
            entity.Property(t => t.Note).HasMaxLength(500);
            entity.HasIndex(t => new { t.HouseholdId, t.Date });

            entity.HasOne<Household>()
                .WithMany()
                .HasForeignKey(t => t.HouseholdId)
                .OnDelete(DeleteBehavior.Cascade);

            // A category in use can't be silently dropped from under a transaction —
            // matches the frontend's existing CategoryInUseError guard, now enforced
            // at the database level too.
            entity.HasOne<Category>()
                .WithMany()
                .HasForeignKey(t => t.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // A transaction shouldn't be deleted just because its originating fixed
            // expense was removed — the link is informational ("mark as paid"), not load-bearing.
            entity.HasOne<FixedMonthlyExpense>()
                .WithMany()
                .HasForeignKey(t => t.FixedExpenseId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<FixedMonthlyExpense>(entity =>
        {
            entity.ToTable("FixedMonthlyExpenses");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.HasIndex(e => e.HouseholdId);

            entity.HasOne<Household>()
                .WithMany()
                .HasForeignKey(e => e.HouseholdId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne<Category>()
                .WithMany()
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<FixedExpensePeriodOverride>(entity =>
        {
            entity.ToTable("FixedExpensePeriodOverrides");
            entity.HasKey(o => new { o.FixedExpenseId, o.PeriodId });
            entity.Property(o => o.PeriodId).HasMaxLength(7); // "YYYY-MM"

            // An override is fully owned by its fixed expense — deleting the expense
            // deletes its overrides too, unlike the Restrict used for Transactions/
            // FixedMonthlyExpenses' reference to a Category, which is a different
            // aggregate.
            entity.HasOne<FixedMonthlyExpense>()
                .WithMany()
                .HasForeignKey(o => o.FixedExpenseId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FinancialPeriodSettings>(entity =>
        {
            entity.ToTable("FinancialPeriodSettings");
            entity.HasKey(s => s.HouseholdId);

            entity.HasOne<Household>()
                .WithMany()
                .HasForeignKey(s => s.HouseholdId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
