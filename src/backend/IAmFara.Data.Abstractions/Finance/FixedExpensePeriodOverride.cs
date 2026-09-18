namespace IAmFara.Data.Abstractions.Finance;

/// <summary>A per-period override of a fixed expense's expected amount — keyed by the opaque "YYYY-MM" period id it was set for.</summary>
public class FixedExpensePeriodOverride
{
    public Guid FixedExpenseId { get; set; }
    public string PeriodId { get; set; } = "";
    public long AmountMinor { get; set; }
}
