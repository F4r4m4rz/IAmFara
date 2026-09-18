namespace IAmFara.Data.Abstractions.Finance;

public class FinancialPeriodSettings
{
    public Guid HouseholdId { get; set; }
    /// <summary>Day of month (1-31) a financial period starts on. Defaults to 1 (plain calendar months).</summary>
    public int FinancialPeriodStartDay { get; set; } = 1;
}
