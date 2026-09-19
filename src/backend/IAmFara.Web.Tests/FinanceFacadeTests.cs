using IAmFara.Data.Abstractions.Finance;
using IAmFara.Data.SqlServer.Finance;
using IAmFara.Finance;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace IAmFara.Web.Tests;

/// <summary>
/// FinanceFacade business-rule tests: non-members are denied, a category in
/// use can't be deleted (matching the frontend's existing CategoryInUseError),
/// and markFixedExpensePaid/Unpaid's idempotent create-or-return/undo
/// semantics — against a real SQLite-backed FinanceDbContext.
/// </summary>
public class FinanceFacadeTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly FinanceDbContext _db;
    private readonly FinanceFacade _finance;
    private readonly HouseholdMembershipRepository _memberships;
    private readonly CategoryRepository _categories;
    private readonly TransactionRepository _transactions;
    private readonly FixedMonthlyExpenseRepository _fixedExpenses;

    public FinanceFacadeTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
        var options = new DbContextOptionsBuilder<FinanceDbContext>().UseSqlite(_connection).Options;
        _db = new FinanceDbContext(options);
        _db.Database.EnsureCreated();

        _memberships = new HouseholdMembershipRepository(_db);
        _categories = new CategoryRepository(_db);
        _transactions = new TransactionRepository(_db);
        _fixedExpenses = new FixedMonthlyExpenseRepository(_db);
        _finance = new FinanceFacade(_memberships, _categories, _transactions, _fixedExpenses, new FixedExpensePeriodOverrideRepository(_db), new FinancialPeriodSettingsRepository(_db));
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    private async Task<Guid> SeedHouseholdWithMemberAsync(Guid userId)
    {
        var householdId = Guid.NewGuid();
        await _db.Households.AddAsync(new Household { Id = householdId, Name = "Test", CreatedAt = DateTimeOffset.UtcNow });
        await _memberships.AddAsync(new HouseholdMembership { Id = Guid.NewGuid(), UserId = userId, HouseholdId = householdId, Role = HouseholdRole.Member, CreatedAt = DateTimeOffset.UtcNow });
        return householdId;
    }

    [Fact]
    public async Task GetTransactionsAsync_ByANonMember_ThrowsNotHouseholdMember()
    {
        var householdId = await SeedHouseholdWithMemberAsync(Guid.NewGuid());
        var stranger = Guid.NewGuid();

        await Assert.ThrowsAsync<NotHouseholdMemberException>(() => _finance.GetTransactionsAsync(stranger, householdId));
    }

    [Fact]
    public async Task AddTransactionAsync_ByANonMember_ThrowsNotHouseholdMember()
    {
        var householdId = await SeedHouseholdWithMemberAsync(Guid.NewGuid());
        var stranger = Guid.NewGuid();

        await Assert.ThrowsAsync<NotHouseholdMemberException>(
            () => _finance.AddTransactionAsync(stranger, householdId, TransactionType.Expense, 100, new DateOnly(2026, 1, 1), Guid.NewGuid(), null, null));
    }

    [Fact]
    public async Task AddTransactionAsync_WithACategoryFromAnotherHousehold_ThrowsKeyNotFound()
    {
        var userId = Guid.NewGuid();
        var householdId = await SeedHouseholdWithMemberAsync(userId);
        var otherOwner = Guid.NewGuid();
        var otherHouseholdId = await SeedHouseholdWithMemberAsync(otherOwner);
        var foreignCategory = await _finance.AddCategoryAsync(otherOwner, otherHouseholdId, TransactionType.Expense, "Not yours");

        // A genuine member of householdId must not be able to point a new
        // transaction at a category belonging to a household they aren't a
        // member of — the database FK alone doesn't enforce this.
        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _finance.AddTransactionAsync(userId, householdId, TransactionType.Expense, 100, new DateOnly(2026, 1, 1), foreignCategory.Id, null, null));
    }

    [Fact]
    public async Task AddTransactionAsync_WithAFixedExpenseFromAnotherHousehold_ThrowsKeyNotFound()
    {
        var userId = Guid.NewGuid();
        var householdId = await SeedHouseholdWithMemberAsync(userId);
        var otherOwner = Guid.NewGuid();
        var otherHouseholdId = await SeedHouseholdWithMemberAsync(otherOwner);
        var foreignCategory = await _finance.AddCategoryAsync(otherOwner, otherHouseholdId, TransactionType.Expense, "Rent");
        var foreignExpense = await _finance.AddFixedExpenseAsync(otherOwner, otherHouseholdId, "Rent", foreignCategory.Id, 100, null);
        var ownCategory = await _finance.AddCategoryAsync(userId, householdId, TransactionType.Expense, "Rent");

        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _finance.AddTransactionAsync(userId, householdId, TransactionType.Expense, 100, new DateOnly(2026, 1, 1), ownCategory.Id, null, foreignExpense.Id));
    }

    [Fact]
    public async Task UpdateTransactionAsync_ToACategoryFromAnotherHousehold_ThrowsKeyNotFound()
    {
        var userId = Guid.NewGuid();
        var householdId = await SeedHouseholdWithMemberAsync(userId);
        var ownCategory = await _finance.AddCategoryAsync(userId, householdId, TransactionType.Expense, "Groceries");
        var transaction = await _finance.AddTransactionAsync(userId, householdId, TransactionType.Expense, 100, new DateOnly(2026, 1, 1), ownCategory.Id, null, null);
        var otherOwner = Guid.NewGuid();
        var otherHouseholdId = await SeedHouseholdWithMemberAsync(otherOwner);
        var foreignCategory = await _finance.AddCategoryAsync(otherOwner, otherHouseholdId, TransactionType.Expense, "Not yours");

        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _finance.UpdateTransactionAsync(userId, householdId, transaction.Id, null, null, null, foreignCategory.Id, null));
    }

    [Fact]
    public async Task AddFixedExpenseAsync_WithACategoryFromAnotherHousehold_ThrowsKeyNotFound()
    {
        var userId = Guid.NewGuid();
        var householdId = await SeedHouseholdWithMemberAsync(userId);
        var otherOwner = Guid.NewGuid();
        var otherHouseholdId = await SeedHouseholdWithMemberAsync(otherOwner);
        var foreignCategory = await _finance.AddCategoryAsync(otherOwner, otherHouseholdId, TransactionType.Expense, "Not yours");

        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _finance.AddFixedExpenseAsync(userId, householdId, "Rent", foreignCategory.Id, 100, null));
    }

    [Fact]
    public async Task UpdateFixedExpenseAsync_ToACategoryFromAnotherHousehold_ThrowsKeyNotFound()
    {
        var userId = Guid.NewGuid();
        var householdId = await SeedHouseholdWithMemberAsync(userId);
        var ownCategory = await _finance.AddCategoryAsync(userId, householdId, TransactionType.Expense, "Rent");
        var expense = await _finance.AddFixedExpenseAsync(userId, householdId, "Rent", ownCategory.Id, 100, null);
        var otherOwner = Guid.NewGuid();
        var otherHouseholdId = await SeedHouseholdWithMemberAsync(otherOwner);
        var foreignCategory = await _finance.AddCategoryAsync(otherOwner, otherHouseholdId, TransactionType.Expense, "Not yours");

        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _finance.UpdateFixedExpenseAsync(userId, householdId, expense.Id, null, foreignCategory.Id, null, null));
    }

    [Fact]
    public async Task DeleteCategoryAsync_WhenReferencedByATransaction_ThrowsCategoryInUseWithTheCorrectCount()
    {
        var userId = Guid.NewGuid();
        var householdId = await SeedHouseholdWithMemberAsync(userId);
        var category = await _finance.AddCategoryAsync(userId, householdId, TransactionType.Expense, "Groceries");
        await _finance.AddTransactionAsync(userId, householdId, TransactionType.Expense, 100, new DateOnly(2026, 1, 1), category.Id, null, null);
        await _finance.AddTransactionAsync(userId, householdId, TransactionType.Expense, 200, new DateOnly(2026, 1, 2), category.Id, null, null);

        var ex = await Assert.ThrowsAsync<CategoryInUseException>(() => _finance.DeleteCategoryAsync(userId, householdId, category.Id));
        Assert.Equal(2, ex.TransactionCount);
    }

    [Fact]
    public async Task DeleteCategoryAsync_WhenUnreferenced_Succeeds()
    {
        var userId = Guid.NewGuid();
        var householdId = await SeedHouseholdWithMemberAsync(userId);
        var category = await _finance.AddCategoryAsync(userId, householdId, TransactionType.Expense, "Unused");

        await _finance.DeleteCategoryAsync(userId, householdId, category.Id);

        Assert.Empty(await _finance.GetCategoriesAsync(userId, householdId));
    }

    [Fact]
    public async Task MarkFixedExpensePaidAsync_CalledTwiceForTheSamePeriod_ReturnsTheSameTransactionInsteadOfDuplicating()
    {
        var userId = Guid.NewGuid();
        var householdId = await SeedHouseholdWithMemberAsync(userId);
        var category = await _finance.AddCategoryAsync(userId, householdId, TransactionType.Expense, "Rent");
        var expense = await _finance.AddFixedExpenseAsync(userId, householdId, "Rent", category.Id, 500000, null);
        var periodStart = new DateOnly(2026, 1, 1);
        var periodEnd = new DateOnly(2026, 1, 31);

        var first = await _finance.MarkFixedExpensePaidAsync(userId, householdId, expense.Id, periodStart, periodEnd, 500000, periodStart);
        var second = await _finance.MarkFixedExpensePaidAsync(userId, householdId, expense.Id, periodStart, periodEnd, 500000, periodStart);

        Assert.Equal(first.Id, second.Id);
        var allTransactions = await _finance.GetTransactionsAsync(userId, householdId);
        Assert.Single(allTransactions);
    }

    [Fact]
    public async Task MarkFixedExpenseUnpaidAsync_RemovesTheLinkedTransaction()
    {
        var userId = Guid.NewGuid();
        var householdId = await SeedHouseholdWithMemberAsync(userId);
        var category = await _finance.AddCategoryAsync(userId, householdId, TransactionType.Expense, "Rent");
        var expense = await _finance.AddFixedExpenseAsync(userId, householdId, "Rent", category.Id, 500000, null);
        var periodStart = new DateOnly(2026, 1, 1);
        var periodEnd = new DateOnly(2026, 1, 31);
        await _finance.MarkFixedExpensePaidAsync(userId, householdId, expense.Id, periodStart, periodEnd, 500000, periodStart);

        await _finance.MarkFixedExpenseUnpaidAsync(userId, householdId, expense.Id, periodStart, periodEnd);

        Assert.Empty(await _finance.GetTransactionsAsync(userId, householdId));
    }

    [Fact]
    public async Task GetSettingsAsync_WhenNeverSet_ReturnsTheDefault()
    {
        var userId = Guid.NewGuid();
        var householdId = await SeedHouseholdWithMemberAsync(userId);

        var settings = await _finance.GetSettingsAsync(userId, householdId);

        Assert.Equal(1, settings.FinancialPeriodStartDay);
    }
}
