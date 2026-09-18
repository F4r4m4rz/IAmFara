namespace IAmFara.Data.Abstractions.Finance;

public class FixedMonthlyExpense
{
    public Guid Id { get; set; }
    public Guid HouseholdId { get; set; }
    public string Name { get; set; } = "";
    public Guid CategoryId { get; set; }
    /// <summary>The amount expected for a period unless overridden — see FixedExpensePeriodOverride.</summary>
    public long DefaultAmountMinor { get; set; }
    /// <summary>Day of month (1-31) this is typically due — purely informational.</summary>
    public int? DueDay { get; set; }
    /// <summary>Archived (false) expenses are excluded from active listings by default but kept forever — never hard-deleted.</summary>
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
