namespace IAmFara.Data.Abstractions.Finance;

/// <summary>Matches the frontend's TransactionType ("income" | "expense") — see domain/types.ts.</summary>
public enum TransactionType
{
    Income = 0,
    Expense = 1,
}
