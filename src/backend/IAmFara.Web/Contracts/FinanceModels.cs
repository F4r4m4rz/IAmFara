using System.Globalization;
using IAmFara.Data.Abstractions.Finance;
using static IAmFara.Web.Contracts.FinanceDtoConversions;

namespace IAmFara.Web.Contracts;

// Field names/shapes deliberately mirror the frontend's domain/types.ts —
// see IAmFara.Finance.FinanceFacade for the household-scoped business logic
// these wrap. Dates are "YYYY-MM-DD"; timestamps are ISO 8601 — matching the
// frontend's own documented conventions exactly.

public record TransactionDto(string Id, string Type, long AmountMinor, string Date, string CategoryId, string? Note, string? FixedExpenseId, string CreatedAt, string UpdatedAt)
{
    public static TransactionDto From(Transaction t) => new(
        t.Id.ToString(), TypeToString(t.Type), t.AmountMinor, DateToString(t.Date), t.CategoryId.ToString(),
        t.Note, t.FixedExpenseId?.ToString(), TimestampToString(t.CreatedAt), TimestampToString(t.UpdatedAt));
}

public record CreateTransactionRequest(string Type, long AmountMinor, string Date, string CategoryId, string? Note, string? FixedExpenseId);

public record UpdateTransactionRequest(string? Type, long? AmountMinor, string? Date, string? CategoryId, string? Note);

public record CategoryDto(string Id, string Type, string? LabelKey, string? Name, string CreatedAt)
{
    public static CategoryDto From(Category c) => new(c.Id.ToString(), TypeToString(c.Type), c.LabelKey, c.Name, TimestampToString(c.CreatedAt));
}

public record CreateCategoryRequest(string Type, string? Name);

public record UpdateCategoryRequest(string? Name);

public record FixedMonthlyExpenseDto(string Id, string Name, string CategoryId, long DefaultAmountMinor, int? DueDay, bool IsActive, string CreatedAt, string UpdatedAt)
{
    public static FixedMonthlyExpenseDto From(FixedMonthlyExpense e) => new(
        e.Id.ToString(), e.Name, e.CategoryId.ToString(), e.DefaultAmountMinor, e.DueDay, e.IsActive,
        TimestampToString(e.CreatedAt), TimestampToString(e.UpdatedAt));
}

public record CreateFixedExpenseRequest(string Name, string CategoryId, long DefaultAmountMinor, int? DueDay);

public record UpdateFixedExpenseRequest(string? Name, string? CategoryId, long? DefaultAmountMinor, int? DueDay);

public record FixedExpensePeriodOverrideDto(string FixedExpenseId, string PeriodId, long AmountMinor)
{
    public static FixedExpensePeriodOverrideDto From(FixedExpensePeriodOverride o) => new(o.FixedExpenseId.ToString(), o.PeriodId, o.AmountMinor);
}

public record SetPeriodOverrideRequest(long AmountMinor);

public record FinanceSettingsDto(int FinancialPeriodStartDay)
{
    public static FinanceSettingsDto From(FinancialPeriodSettings s) => new(s.FinancialPeriodStartDay);
}

public record UpdateFinanceSettingsRequest(int? FinancialPeriodStartDay);

public record MarkFixedExpensePaidRequest(string FromDate, string ToDate, long AmountMinor, string Date);

public record MarkFixedExpenseUnpaidRequest(string FromDate, string ToDate);

internal static class FinanceDtoConversions
{
    public static string TypeToString(TransactionType type) => type switch
    {
        TransactionType.Income => "income",
        TransactionType.Expense => "expense",
        _ => throw new ArgumentOutOfRangeException(nameof(type)),
    };

    public static TransactionType TypeFromString(string type) => type switch
    {
        "income" => TransactionType.Income,
        "expense" => TransactionType.Expense,
        _ => throw new ArgumentException($"Unknown transaction type \"{type}\".", nameof(type)),
    };

    public static string DateToString(DateOnly date) => date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

    public static DateOnly DateFromString(string date) => DateOnly.ParseExact(date, "yyyy-MM-dd", CultureInfo.InvariantCulture);

    public static string TimestampToString(DateTimeOffset timestamp) => timestamp.ToString("O", CultureInfo.InvariantCulture);
}
