using IAmFara.Data.Abstractions.Finance;
using IAmFara.Data.SqlServer.Finance;
using Microsoft.EntityFrameworkCore;

namespace IAmFara.Web.Tests;

/// <summary>
/// Targeted (not exhaustive — see SqlServerFixture) tests against a real SQL
/// Server, for behavior SQLite either can't validate at all (schema-level
/// restrictions like multiple cascade paths, only checked when the schema is
/// actually created) or might not enforce identically. Each test gets its
/// own household, so tests can share the one running container without
/// interfering with each other.
/// </summary>
[Collection("SqlServer")]
public class SqlServerIntegrationTests
{
    private readonly SqlServerFixture _fixture;

    public SqlServerIntegrationTests(SqlServerFixture fixture)
    {
        _fixture = fixture;
    }

    private FinanceDbContext NewFinanceDb() =>
        new(new DbContextOptionsBuilder<FinanceDbContext>().UseSqlServer(_fixture.ConnectionString).Options);

    [Fact]
    public async Task AllThreeMigrationSets_AppliedSuccessfullyOnAFreshDatabase()
    {
        // If any migration had failed, SqlServerFixture.InitializeAsync would
        // have thrown before any test in this collection ever ran — this just
        // makes that success explicit and asserts on it.
        await using var db = NewFinanceDb();
        var canConnect = await db.Database.CanConnectAsync();
        Assert.True(canConnect);
    }

    [Fact]
    public async Task DeletingAHousehold_CascadesToTransactionsAndFixedMonthlyExpensesTogether()
    {
        // The exact scenario that failed schema creation with "may cause
        // cycles or multiple cascade paths" before FinanceDbContext's
        // Transactions.FixedExpenseId relationship was changed from SetNull
        // to Restrict — proves the current configuration doesn't just create
        // successfully but actually behaves as intended end to end.
        await using var db = NewFinanceDb();

        var household = new Household { Id = Guid.NewGuid(), Name = "Test", CreatedAt = DateTimeOffset.UtcNow };
        db.Households.Add(household);
        var category = new Category { Id = Guid.NewGuid(), HouseholdId = household.Id, Type = TransactionType.Expense, Name = "Rent", CreatedAt = DateTimeOffset.UtcNow };
        db.Categories.Add(category);
        var expense = new FixedMonthlyExpense { Id = Guid.NewGuid(), HouseholdId = household.Id, Name = "Rent", CategoryId = category.Id, DefaultAmountMinor = 100, IsActive = true, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow };
        db.FixedMonthlyExpenses.Add(expense);
        var transaction = new Transaction { Id = Guid.NewGuid(), HouseholdId = household.Id, Type = TransactionType.Expense, AmountMinor = 100, Date = new DateOnly(2026, 1, 1), CategoryId = category.Id, CreatedByUserId = Guid.NewGuid(), CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow };
        db.Transactions.Add(transaction);
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();

        db.Households.Remove((await db.Households.FindAsync(household.Id))!);
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();

        Assert.Null(await db.Households.FindAsync(household.Id));
        Assert.Null(await db.Transactions.FindAsync(transaction.Id));
        Assert.Null(await db.FixedMonthlyExpenses.FindAsync(expense.Id));
        Assert.Null(await db.Categories.FindAsync(category.Id));
    }

    [Fact]
    public async Task DeletingAFixedMonthlyExpense_IsRestrictedWhileReferencedByATransaction()
    {
        await using var db = NewFinanceDb();

        var household = new Household { Id = Guid.NewGuid(), Name = "Test", CreatedAt = DateTimeOffset.UtcNow };
        db.Households.Add(household);
        var category = new Category { Id = Guid.NewGuid(), HouseholdId = household.Id, Type = TransactionType.Expense, Name = "Rent", CreatedAt = DateTimeOffset.UtcNow };
        db.Categories.Add(category);
        var expense = new FixedMonthlyExpense { Id = Guid.NewGuid(), HouseholdId = household.Id, Name = "Rent", CategoryId = category.Id, DefaultAmountMinor = 100, IsActive = true, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow };
        db.FixedMonthlyExpenses.Add(expense);
        db.Transactions.Add(new Transaction { Id = Guid.NewGuid(), HouseholdId = household.Id, Type = TransactionType.Expense, AmountMinor = 100, Date = new DateOnly(2026, 1, 1), CategoryId = category.Id, FixedExpenseId = expense.Id, CreatedByUserId = Guid.NewGuid(), CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow });
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();

        db.FixedMonthlyExpenses.Remove((await db.FixedMonthlyExpenses.FindAsync(expense.Id))!);

        await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
    }
}
