using IAmFara.Data.Abstractions.Finance;

namespace IAmFara.Finance;

/// <summary>
/// Household-scoped finance data — transactions, categories, fixed monthly
/// expenses, and financial period settings. Every method re-derives the
/// acting user from an explicit currentUserId parameter and checks
/// HouseholdMembership before doing anything (any Member, not just an Owner —
/// unlike household/invitation management in HouseholdFacade, ordinary
/// finance data isn't Owner-restricted).
/// </summary>
public class FinanceFacade(
    IHouseholdMembershipRepository memberships,
    ICategoryRepository categories,
    ITransactionRepository transactions,
    IFixedMonthlyExpenseRepository fixedExpenses,
    IFixedExpensePeriodOverrideRepository periodOverrides,
    IFinancialPeriodSettingsRepository periodSettings)
{
    // ---- Transactions ----

    public async Task<IReadOnlyList<Transaction>> GetTransactionsAsync(Guid currentUserId, Guid householdId, TransactionFilter? filter = null, CancellationToken cancellationToken = default)
    {
        await RequireMembershipAsync(currentUserId, householdId, cancellationToken);
        return await transactions.GetByHouseholdIdAsync(householdId, filter, cancellationToken);
    }

    public async Task<Transaction?> GetTransactionAsync(Guid currentUserId, Guid householdId, Guid id, CancellationToken cancellationToken = default)
    {
        await RequireMembershipAsync(currentUserId, householdId, cancellationToken);
        return await transactions.GetByIdAsync(householdId, id, cancellationToken);
    }

    public async Task<Transaction> AddTransactionAsync(Guid currentUserId, Guid householdId, TransactionType type, long amountMinor, DateOnly date, Guid categoryId, string? note, Guid? fixedExpenseId, CancellationToken cancellationToken = default)
    {
        await RequireMembershipAsync(currentUserId, householdId, cancellationToken);
        await EnsureCategoryInHouseholdAsync(householdId, categoryId, cancellationToken);
        if (fixedExpenseId is { } fxId) await EnsureFixedExpenseInHouseholdAsync(householdId, fxId, cancellationToken);

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            HouseholdId = householdId,
            Type = type,
            AmountMinor = amountMinor,
            Date = date,
            CategoryId = categoryId,
            Note = note,
            FixedExpenseId = fixedExpenseId,
            CreatedByUserId = currentUserId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        await transactions.AddAsync(transaction, cancellationToken);
        return transaction;
    }

    public async Task<Transaction> UpdateTransactionAsync(
        Guid currentUserId, Guid householdId, Guid id,
        TransactionType? type, long? amountMinor, DateOnly? date, Guid? categoryId, string? note,
        CancellationToken cancellationToken = default)
    {
        await RequireMembershipAsync(currentUserId, householdId, cancellationToken);
        var transaction = await transactions.GetByIdAsync(householdId, id, cancellationToken)
            ?? throw new KeyNotFoundException();

        // A caller who is a genuine member of householdId could otherwise
        // point a transaction at a categoryId belonging to a household they
        // have no access to — the database FK only checks the category
        // exists somewhere, not that it belongs to this household.
        if (categoryId is { } newCategoryId)
        {
            await EnsureCategoryInHouseholdAsync(householdId, newCategoryId, cancellationToken);
            transaction.CategoryId = newCategoryId;
        }
        if (type is { } newType) transaction.Type = newType;
        if (amountMinor is { } newAmountMinor) transaction.AmountMinor = newAmountMinor;
        if (date is { } newDate) transaction.Date = newDate;
        if (note is not null) transaction.Note = note;

        transaction.UpdatedAt = DateTimeOffset.UtcNow;
        await transactions.UpdateAsync(transaction, cancellationToken);
        return transaction;
    }

    public async Task DeleteTransactionAsync(Guid currentUserId, Guid householdId, Guid id, CancellationToken cancellationToken = default)
    {
        await RequireMembershipAsync(currentUserId, householdId, cancellationToken);
        await transactions.DeleteAsync(householdId, id, cancellationToken);
    }

    // ---- Categories ----

    public async Task<IReadOnlyList<Category>> GetCategoriesAsync(Guid currentUserId, Guid householdId, CancellationToken cancellationToken = default)
    {
        await RequireMembershipAsync(currentUserId, householdId, cancellationToken);
        return await categories.GetByHouseholdIdAsync(householdId, cancellationToken);
    }

    public async Task<Category> AddCategoryAsync(Guid currentUserId, Guid householdId, TransactionType type, string name, CancellationToken cancellationToken = default)
    {
        await RequireMembershipAsync(currentUserId, householdId, cancellationToken);

        var category = new Category
        {
            Id = Guid.NewGuid(),
            HouseholdId = householdId,
            Type = type,
            Name = name,
            CreatedAt = DateTimeOffset.UtcNow,
        };
        await categories.AddAsync(category, cancellationToken);
        return category;
    }

    public async Task<Category> UpdateCategoryAsync(Guid currentUserId, Guid householdId, Guid id, string name, CancellationToken cancellationToken = default)
    {
        await RequireMembershipAsync(currentUserId, householdId, cancellationToken);
        var category = await categories.GetByIdAsync(householdId, id, cancellationToken)
            ?? throw new KeyNotFoundException();

        category.Name = name;
        await categories.UpdateAsync(category, cancellationToken);
        return category;
    }

    /// <summary>Throws CategoryInUseException if any transaction still references it (a pre-check, matching the frontend's existing guard, rather than relying on the database's own Restrict foreign key).</summary>
    public async Task DeleteCategoryAsync(Guid currentUserId, Guid householdId, Guid id, CancellationToken cancellationToken = default)
    {
        await RequireMembershipAsync(currentUserId, householdId, cancellationToken);

        var referencing = await transactions.GetByHouseholdIdAsync(householdId, new TransactionFilter(CategoryId: id), cancellationToken);
        if (referencing.Count > 0)
        {
            throw new CategoryInUseException(id, referencing.Count);
        }

        await categories.DeleteAsync(householdId, id, cancellationToken);
    }

    // ---- Fixed monthly expenses ----

    public async Task<IReadOnlyList<FixedMonthlyExpense>> GetFixedExpensesAsync(Guid currentUserId, Guid householdId, bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        await RequireMembershipAsync(currentUserId, householdId, cancellationToken);
        return await fixedExpenses.GetByHouseholdIdAsync(householdId, includeInactive, cancellationToken);
    }

    public async Task<FixedMonthlyExpense> AddFixedExpenseAsync(Guid currentUserId, Guid householdId, string name, Guid categoryId, long defaultAmountMinor, int? dueDay, CancellationToken cancellationToken = default)
    {
        await RequireMembershipAsync(currentUserId, householdId, cancellationToken);
        await EnsureCategoryInHouseholdAsync(householdId, categoryId, cancellationToken);

        var expense = new FixedMonthlyExpense
        {
            Id = Guid.NewGuid(),
            HouseholdId = householdId,
            Name = name,
            CategoryId = categoryId,
            DefaultAmountMinor = defaultAmountMinor,
            DueDay = dueDay,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        await fixedExpenses.AddAsync(expense, cancellationToken);
        return expense;
    }

    public async Task<FixedMonthlyExpense> UpdateFixedExpenseAsync(
        Guid currentUserId, Guid householdId, Guid id,
        string? name, Guid? categoryId, long? defaultAmountMinor, int? dueDay,
        CancellationToken cancellationToken = default)
    {
        await RequireMembershipAsync(currentUserId, householdId, cancellationToken);
        var expense = await fixedExpenses.GetByIdAsync(householdId, id, cancellationToken)
            ?? throw new KeyNotFoundException();

        if (categoryId is { } newCategoryId)
        {
            await EnsureCategoryInHouseholdAsync(householdId, newCategoryId, cancellationToken);
            expense.CategoryId = newCategoryId;
        }
        if (name is not null) expense.Name = name;
        if (defaultAmountMinor is { } newDefaultAmountMinor) expense.DefaultAmountMinor = newDefaultAmountMinor;
        if (dueDay is not null) expense.DueDay = dueDay;

        expense.UpdatedAt = DateTimeOffset.UtcNow;
        await fixedExpenses.UpdateAsync(expense, cancellationToken);
        return expense;
    }

    /// <summary>Archived (false) expenses are excluded from active listings by default but kept forever — never hard-deleted.</summary>
    public async Task SetFixedExpenseActiveAsync(Guid currentUserId, Guid householdId, Guid id, bool isActive, CancellationToken cancellationToken = default)
    {
        await RequireMembershipAsync(currentUserId, householdId, cancellationToken);
        var expense = await fixedExpenses.GetByIdAsync(householdId, id, cancellationToken)
            ?? throw new KeyNotFoundException();

        expense.IsActive = isActive;
        expense.UpdatedAt = DateTimeOffset.UtcNow;
        await fixedExpenses.UpdateAsync(expense, cancellationToken);
    }

    // ---- Fixed expense period overrides ----

    public async Task<IReadOnlyList<FixedExpensePeriodOverride>> GetPeriodOverridesAsync(Guid currentUserId, Guid householdId, string periodId, CancellationToken cancellationToken = default)
    {
        await RequireMembershipAsync(currentUserId, householdId, cancellationToken);
        return await periodOverrides.GetByHouseholdAndPeriodAsync(householdId, periodId, cancellationToken);
    }

    public async Task SetPeriodOverrideAsync(Guid currentUserId, Guid householdId, Guid fixedExpenseId, string periodId, long amountMinor, CancellationToken cancellationToken = default)
    {
        await RequireMembershipAsync(currentUserId, householdId, cancellationToken);
        await periodOverrides.SetAsync(householdId, new FixedExpensePeriodOverride { FixedExpenseId = fixedExpenseId, PeriodId = periodId, AmountMinor = amountMinor }, cancellationToken);
    }

    public async Task ClearPeriodOverrideAsync(Guid currentUserId, Guid householdId, Guid fixedExpenseId, string periodId, CancellationToken cancellationToken = default)
    {
        await RequireMembershipAsync(currentUserId, householdId, cancellationToken);
        await periodOverrides.ClearAsync(householdId, fixedExpenseId, periodId, cancellationToken);
    }

    // ---- Financial period settings ----

    public async Task<FinancialPeriodSettings> GetSettingsAsync(Guid currentUserId, Guid householdId, CancellationToken cancellationToken = default)
    {
        await RequireMembershipAsync(currentUserId, householdId, cancellationToken);
        return await periodSettings.GetByHouseholdIdAsync(householdId, cancellationToken)
            ?? new FinancialPeriodSettings { HouseholdId = householdId, FinancialPeriodStartDay = 1 };
    }

    public async Task<FinancialPeriodSettings> UpdateSettingsAsync(Guid currentUserId, Guid householdId, int financialPeriodStartDay, CancellationToken cancellationToken = default)
    {
        await RequireMembershipAsync(currentUserId, householdId, cancellationToken);
        var settings = new FinancialPeriodSettings { HouseholdId = householdId, FinancialPeriodStartDay = financialPeriodStartDay };
        await periodSettings.UpsertAsync(settings, cancellationToken);
        return settings;
    }

    // ---- Fixed expense paid/unpaid (see the frontend's FinanceRepository for the exact semantics this mirrors) ----

    /// <summary>Idempotent: a period that already has a linked transaction returns the existing one instead of creating a duplicate.</summary>
    public async Task<Transaction> MarkFixedExpensePaidAsync(Guid currentUserId, Guid householdId, Guid fixedExpenseId, DateOnly periodFromDate, DateOnly periodToDate, long amountMinor, DateOnly date, CancellationToken cancellationToken = default)
    {
        await RequireMembershipAsync(currentUserId, householdId, cancellationToken);

        var filter = new TransactionFilter(FromDate: periodFromDate, ToDate: periodToDate, FixedExpenseId: fixedExpenseId);
        var existing = (await transactions.GetByHouseholdIdAsync(householdId, filter, cancellationToken)).FirstOrDefault();
        if (existing is not null) return existing;

        var expense = await fixedExpenses.GetByIdAsync(householdId, fixedExpenseId, cancellationToken)
            ?? throw new KeyNotFoundException();

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            HouseholdId = householdId,
            Type = TransactionType.Expense,
            AmountMinor = amountMinor,
            Date = date,
            CategoryId = expense.CategoryId,
            FixedExpenseId = fixedExpenseId,
            CreatedByUserId = currentUserId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        await transactions.AddAsync(transaction, cancellationToken);
        return transaction;
    }

    /// <summary>Finds and deletes the transaction linked to this fixed expense within the period, if any — the entire "undo" mechanism.</summary>
    public async Task MarkFixedExpenseUnpaidAsync(Guid currentUserId, Guid householdId, Guid fixedExpenseId, DateOnly periodFromDate, DateOnly periodToDate, CancellationToken cancellationToken = default)
    {
        await RequireMembershipAsync(currentUserId, householdId, cancellationToken);

        var filter = new TransactionFilter(FromDate: periodFromDate, ToDate: periodToDate, FixedExpenseId: fixedExpenseId);
        var existing = (await transactions.GetByHouseholdIdAsync(householdId, filter, cancellationToken)).FirstOrDefault();
        if (existing is not null)
        {
            await transactions.DeleteAsync(householdId, existing.Id, cancellationToken);
        }
    }

    private async Task RequireMembershipAsync(Guid userId, Guid householdId, CancellationToken cancellationToken)
    {
        var membership = await memberships.GetAsync(userId, householdId, cancellationToken);
        if (membership is null)
        {
            throw new NotHouseholdMemberException();
        }
    }

    /// <summary>
    /// Guards against a caller referencing another household's category — the
    /// database foreign key only checks the category exists somewhere, not
    /// that it belongs to the household the caller is actually a member of.
    /// </summary>
    private async Task EnsureCategoryInHouseholdAsync(Guid householdId, Guid categoryId, CancellationToken cancellationToken)
    {
        var category = await categories.GetByIdAsync(householdId, categoryId, cancellationToken);
        if (category is null)
        {
            throw new KeyNotFoundException($"Category {categoryId} does not belong to this household.");
        }
    }

    private async Task EnsureFixedExpenseInHouseholdAsync(Guid householdId, Guid fixedExpenseId, CancellationToken cancellationToken)
    {
        var expense = await fixedExpenses.GetByIdAsync(householdId, fixedExpenseId, cancellationToken);
        if (expense is null)
        {
            throw new KeyNotFoundException($"Fixed expense {fixedExpenseId} does not belong to this household.");
        }
    }
}
