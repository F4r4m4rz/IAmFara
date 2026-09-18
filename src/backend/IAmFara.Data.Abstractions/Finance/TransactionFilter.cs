namespace IAmFara.Data.Abstractions.Finance;

/// <summary>Period-agnostic — period boundaries are resolved by the caller before filtering.</summary>
public record TransactionFilter(
    DateOnly? FromDate = null,
    DateOnly? ToDate = null,
    Guid? CategoryId = null,
    TransactionType? Type = null);
