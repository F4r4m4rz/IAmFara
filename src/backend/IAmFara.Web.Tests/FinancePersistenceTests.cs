using IAmFara.Data.Abstractions.Finance;
using IAmFara.Data.SqlServer.Finance;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace IAmFara.Web.Tests;

/// <summary>
/// Persistence tests for FinanceDbContext against a SQLite in-memory database,
/// matching the AnalyticsReportServiceTests/IdentityPersistenceTests pattern.
/// Cross-household isolation is treated as a critical defect to prevent, not
/// an edge case (see the plan's §5) — every household-owned aggregate below
/// has an explicit test proving a query scoped to Household A never returns
/// Household B's rows.
/// </summary>
public class FinancePersistenceTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly FinanceDbContext _db;
    private readonly HouseholdRepository _households;
    private readonly HouseholdMembershipRepository _memberships;
    private readonly HouseholdInvitationRepository _householdInvitations;
    private readonly CategoryRepository _categories;
    private readonly TransactionRepository _transactions;
    private readonly FixedMonthlyExpenseRepository _fixedExpenses;
    private readonly FixedExpensePeriodOverrideRepository _periodOverrides;
    private readonly FinancialPeriodSettingsRepository _periodSettings;

    public FinancePersistenceTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<FinanceDbContext>()
            .UseSqlite(_connection)
            .Options;

        _db = new FinanceDbContext(options);
        _db.Database.EnsureCreated();

        _households = new HouseholdRepository(_db);
        _memberships = new HouseholdMembershipRepository(_db);
        _householdInvitations = new HouseholdInvitationRepository(_db);
        _categories = new CategoryRepository(_db);
        _transactions = new TransactionRepository(_db);
        _fixedExpenses = new FixedMonthlyExpenseRepository(_db);
        _periodOverrides = new FixedExpensePeriodOverrideRepository(_db);
        _periodSettings = new FinancialPeriodSettingsRepository(_db);
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    private static Household NewHousehold(string name = "Test Household") => new()
    {
        Id = Guid.NewGuid(),
        Name = name,
        CreatedAt = DateTimeOffset.UtcNow,
    };

    private async Task<Category> AddCategory(Guid householdId, TransactionType type = TransactionType.Expense)
    {
        var category = new Category
        {
            Id = Guid.NewGuid(),
            HouseholdId = householdId,
            Type = type,
            Name = "Groceries",
            CreatedAt = DateTimeOffset.UtcNow,
        };
        await _categories.AddAsync(category);
        return category;
    }

    private async Task<Transaction> AddTransaction(Guid householdId, Guid categoryId, Guid? fixedExpenseId = null)
    {
        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            HouseholdId = householdId,
            Type = TransactionType.Expense,
            AmountMinor = 1000,
            Date = new DateOnly(2026, 1, 15),
            CategoryId = categoryId,
            FixedExpenseId = fixedExpenseId,
            CreatedByUserId = Guid.NewGuid(),
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        await _transactions.AddAsync(transaction);
        return transaction;
    }

    private async Task<FixedMonthlyExpense> AddFixedExpense(Guid householdId, Guid categoryId)
    {
        var expense = new FixedMonthlyExpense
        {
            Id = Guid.NewGuid(),
            HouseholdId = householdId,
            Name = "Rent",
            CategoryId = categoryId,
            DefaultAmountMinor = 500000,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        await _fixedExpenses.AddAsync(expense);
        return expense;
    }

    // ---- Basic persistence ----

    [Fact]
    public async Task Household_AddAsync_ThenGetById_ReturnsTheSameHousehold()
    {
        var household = NewHousehold();

        await _households.AddAsync(household);
        var found = await _households.GetByIdAsync(household.Id);

        Assert.NotNull(found);
        Assert.Equal(household.Name, found!.Name);
    }

    // ---- Constraints ----

    [Fact]
    public async Task HouseholdMembership_DuplicateUserAndHousehold_ViolatesUniqueConstraint()
    {
        var household = NewHousehold();
        await _households.AddAsync(household);
        var userId = Guid.NewGuid();

        await _memberships.AddAsync(new HouseholdMembership
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            HouseholdId = household.Id,
            Role = HouseholdRole.Owner,
            CreatedAt = DateTimeOffset.UtcNow,
        });

        var duplicate = new HouseholdMembership
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            HouseholdId = household.Id,
            Role = HouseholdRole.Member,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        await Assert.ThrowsAsync<DbUpdateException>(() => _memberships.AddAsync(duplicate));
    }

    [Fact]
    public async Task HouseholdInvitation_DuplicateTokenHash_ViolatesUniqueConstraint()
    {
        var household = NewHousehold();
        await _households.AddAsync(household);
        var tokenHash = new byte[] { 1, 2, 3 };

        await _householdInvitations.AddAsync(new HouseholdInvitation
        {
            Id = Guid.NewGuid(),
            TokenHash = tokenHash,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(1),
            HouseholdId = household.Id,
            Role = HouseholdRole.Member,
            CreatedByUserId = Guid.NewGuid(),
            CreatedAt = DateTimeOffset.UtcNow,
        });

        var duplicate = new HouseholdInvitation
        {
            Id = Guid.NewGuid(),
            TokenHash = tokenHash,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(1),
            HouseholdId = household.Id,
            Role = HouseholdRole.Member,
            CreatedByUserId = Guid.NewGuid(),
            CreatedAt = DateTimeOffset.UtcNow,
        };

        await Assert.ThrowsAsync<DbUpdateException>(() => _householdInvitations.AddAsync(duplicate));
    }

    [Fact]
    public async Task HouseholdInvitation_TryConsumeAsync_FirstCallSucceeds_SecondCallFails()
    {
        var household = NewHousehold();
        await _households.AddAsync(household);
        var invitation = new HouseholdInvitation
        {
            Id = Guid.NewGuid(),
            TokenHash = [9, 9, 9],
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(1),
            HouseholdId = household.Id,
            Role = HouseholdRole.Member,
            CreatedByUserId = Guid.NewGuid(),
            CreatedAt = DateTimeOffset.UtcNow,
        };
        await _householdInvitations.AddAsync(invitation);

        var first = await _householdInvitations.TryConsumeAsync(invitation.Id, DateTimeOffset.UtcNow);
        var second = await _householdInvitations.TryConsumeAsync(invitation.Id, DateTimeOffset.UtcNow);

        Assert.True(first);
        Assert.False(second);
    }

    // ---- Delete behaviors ----

    [Fact]
    public async Task Category_Deletion_IsRestrictedWhileReferencedByATransaction()
    {
        var household = NewHousehold();
        await _households.AddAsync(household);
        var category = await AddCategory(household.Id);
        await AddTransaction(household.Id, category.Id);
        _db.ChangeTracker.Clear();

        await Assert.ThrowsAsync<DbUpdateException>(() => _categories.DeleteAsync(household.Id, category.Id));
    }

    [Fact]
    public async Task Category_Deletion_IsRestrictedWhileReferencedByAFixedExpense()
    {
        var household = NewHousehold();
        await _households.AddAsync(household);
        var category = await AddCategory(household.Id);
        await AddFixedExpense(household.Id, category.Id);
        _db.ChangeTracker.Clear();

        await Assert.ThrowsAsync<DbUpdateException>(() => _categories.DeleteAsync(household.Id, category.Id));
    }

    [Fact]
    public async Task Transaction_FixedExpenseId_SetsNullWhenTheFixedExpenseIsDeleted()
    {
        var household = NewHousehold();
        await _households.AddAsync(household);
        var category = await AddCategory(household.Id);
        var expense = await AddFixedExpense(household.Id, category.Id);
        var transaction = await AddTransaction(household.Id, category.Id, expense.Id);
        _db.ChangeTracker.Clear();

        _db.FixedMonthlyExpenses.Remove((await _fixedExpenses.GetByIdAsync(household.Id, expense.Id))!);
        await _db.SaveChangesAsync();
        _db.ChangeTracker.Clear();

        var reloaded = await _transactions.GetByIdAsync(household.Id, transaction.Id);
        Assert.Null(reloaded!.FixedExpenseId);
    }

    [Fact]
    public async Task Household_Deletion_CascadesToItsOwnedData()
    {
        var household = NewHousehold();
        await _households.AddAsync(household);
        var category = await AddCategory(household.Id);
        await AddTransaction(household.Id, category.Id);
        _db.ChangeTracker.Clear();

        _db.Households.Remove((await _households.GetByIdAsync(household.Id))!);
        await _db.SaveChangesAsync();
        _db.ChangeTracker.Clear();

        Assert.Empty(await _categories.GetByHouseholdIdAsync(household.Id));
        Assert.Empty(await _transactions.GetByHouseholdIdAsync(household.Id));
    }

    // ---- Cross-household isolation (§5: treated as a critical defect to prevent) ----

    [Fact]
    public async Task HouseholdMembership_GetByHouseholdId_NeverReturnsAnotherHouseholdsMemberships()
    {
        var householdA = NewHousehold("A");
        var householdB = NewHousehold("B");
        await _households.AddAsync(householdA);
        await _households.AddAsync(householdB);
        await _memberships.AddAsync(new HouseholdMembership { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), HouseholdId = householdA.Id, Role = HouseholdRole.Owner, CreatedAt = DateTimeOffset.UtcNow });
        await _memberships.AddAsync(new HouseholdMembership { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), HouseholdId = householdB.Id, Role = HouseholdRole.Owner, CreatedAt = DateTimeOffset.UtcNow });

        var result = await _memberships.GetByHouseholdIdAsync(householdA.Id);

        Assert.Single(result);
        Assert.Equal(householdA.Id, result[0].HouseholdId);
    }

    [Fact]
    public async Task Category_GetByHouseholdId_NeverReturnsAnotherHouseholdsCategories()
    {
        var householdA = NewHousehold("A");
        var householdB = NewHousehold("B");
        await _households.AddAsync(householdA);
        await _households.AddAsync(householdB);
        var categoryA = await AddCategory(householdA.Id);
        await AddCategory(householdB.Id);

        var result = await _categories.GetByHouseholdIdAsync(householdA.Id);

        Assert.Single(result);
        Assert.Equal(categoryA.Id, result[0].Id);
    }

    [Fact]
    public async Task Category_GetById_ReturnsNullWhenTheCategoryBelongsToAnotherHousehold()
    {
        var householdA = NewHousehold("A");
        var householdB = NewHousehold("B");
        await _households.AddAsync(householdA);
        await _households.AddAsync(householdB);
        var categoryB = await AddCategory(householdB.Id);

        var result = await _categories.GetByIdAsync(householdA.Id, categoryB.Id);

        Assert.Null(result);
    }

    [Fact]
    public async Task Transaction_GetByHouseholdId_NeverReturnsAnotherHouseholdsTransactions()
    {
        var householdA = NewHousehold("A");
        var householdB = NewHousehold("B");
        await _households.AddAsync(householdA);
        await _households.AddAsync(householdB);
        var categoryA = await AddCategory(householdA.Id);
        var categoryB = await AddCategory(householdB.Id);
        var transactionA = await AddTransaction(householdA.Id, categoryA.Id);
        await AddTransaction(householdB.Id, categoryB.Id);

        var result = await _transactions.GetByHouseholdIdAsync(householdA.Id);

        Assert.Single(result);
        Assert.Equal(transactionA.Id, result[0].Id);
    }

    [Fact]
    public async Task Transaction_GetById_ReturnsNullWhenTheTransactionBelongsToAnotherHousehold()
    {
        var householdA = NewHousehold("A");
        var householdB = NewHousehold("B");
        await _households.AddAsync(householdA);
        await _households.AddAsync(householdB);
        var categoryB = await AddCategory(householdB.Id);
        var transactionB = await AddTransaction(householdB.Id, categoryB.Id);

        var result = await _transactions.GetByIdAsync(householdA.Id, transactionB.Id);

        Assert.Null(result);
    }

    [Fact]
    public async Task Transaction_DeleteAsync_DoesNothingWhenTheTransactionBelongsToAnotherHousehold()
    {
        var householdA = NewHousehold("A");
        var householdB = NewHousehold("B");
        await _households.AddAsync(householdA);
        await _households.AddAsync(householdB);
        var categoryB = await AddCategory(householdB.Id);
        var transactionB = await AddTransaction(householdB.Id, categoryB.Id);

        await _transactions.DeleteAsync(householdA.Id, transactionB.Id);

        Assert.NotNull(await _transactions.GetByIdAsync(householdB.Id, transactionB.Id));
    }

    [Fact]
    public async Task FixedMonthlyExpense_GetByHouseholdId_NeverReturnsAnotherHouseholdsExpenses()
    {
        var householdA = NewHousehold("A");
        var householdB = NewHousehold("B");
        await _households.AddAsync(householdA);
        await _households.AddAsync(householdB);
        var categoryA = await AddCategory(householdA.Id);
        var categoryB = await AddCategory(householdB.Id);
        var expenseA = await AddFixedExpense(householdA.Id, categoryA.Id);
        await AddFixedExpense(householdB.Id, categoryB.Id);

        var result = await _fixedExpenses.GetByHouseholdIdAsync(householdA.Id);

        Assert.Single(result);
        Assert.Equal(expenseA.Id, result[0].Id);
    }

    [Fact]
    public async Task FixedExpensePeriodOverride_SetAsync_ThrowsWhenExpenseBelongsToAnotherHousehold()
    {
        var householdA = NewHousehold("A");
        var householdB = NewHousehold("B");
        await _households.AddAsync(householdA);
        await _households.AddAsync(householdB);
        var categoryB = await AddCategory(householdB.Id);
        var expenseB = await AddFixedExpense(householdB.Id, categoryB.Id);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _periodOverrides.SetAsync(
            householdA.Id,
            new FixedExpensePeriodOverride { FixedExpenseId = expenseB.Id, PeriodId = "2026-01", AmountMinor = 100 }));
    }

    [Fact]
    public async Task FixedExpensePeriodOverride_GetByHouseholdAndPeriod_NeverReturnsAnotherHouseholdsOverrides()
    {
        var householdA = NewHousehold("A");
        var householdB = NewHousehold("B");
        await _households.AddAsync(householdA);
        await _households.AddAsync(householdB);
        var categoryA = await AddCategory(householdA.Id);
        var categoryB = await AddCategory(householdB.Id);
        var expenseA = await AddFixedExpense(householdA.Id, categoryA.Id);
        var expenseB = await AddFixedExpense(householdB.Id, categoryB.Id);
        await _periodOverrides.SetAsync(householdA.Id, new FixedExpensePeriodOverride { FixedExpenseId = expenseA.Id, PeriodId = "2026-01", AmountMinor = 111 });
        await _periodOverrides.SetAsync(householdB.Id, new FixedExpensePeriodOverride { FixedExpenseId = expenseB.Id, PeriodId = "2026-01", AmountMinor = 222 });

        var result = await _periodOverrides.GetByHouseholdAndPeriodAsync(householdA.Id, "2026-01");

        Assert.Single(result);
        Assert.Equal(expenseA.Id, result[0].FixedExpenseId);
    }

    [Fact]
    public async Task FinancialPeriodSettings_GetByHouseholdId_ReturnsNullWhenSetForAnotherHouseholdOnly()
    {
        var householdA = NewHousehold("A");
        var householdB = NewHousehold("B");
        await _households.AddAsync(householdA);
        await _households.AddAsync(householdB);
        await _periodSettings.UpsertAsync(new FinancialPeriodSettings { HouseholdId = householdB.Id, FinancialPeriodStartDay = 15 });

        var result = await _periodSettings.GetByHouseholdIdAsync(householdA.Id);

        Assert.Null(result);
    }
}
