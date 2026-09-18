namespace IAmFara.Finance;

/// <summary>Thrown by DeleteCategoryAsync when a transaction still references the category — matches the frontend's existing CategoryInUseError.</summary>
public class CategoryInUseException(Guid categoryId, int transactionCount)
    : Exception($"Category \"{categoryId}\" is referenced by {transactionCount} transaction(s)")
{
    public Guid CategoryId { get; } = categoryId;
    public int TransactionCount { get; } = transactionCount;
}
