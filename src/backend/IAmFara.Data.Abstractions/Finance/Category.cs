namespace IAmFara.Data.Abstractions.Finance;

public class Category
{
    public Guid Id { get; set; }
    public Guid HouseholdId { get; set; }
    public TransactionType Type { get; set; }
    /// <summary>i18n key for a default category's label; null means custom (use Name instead).</summary>
    public string? LabelKey { get; set; }
    /// <summary>User-entered literal name for a custom category; null for defaults.</summary>
    public string? Name { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
