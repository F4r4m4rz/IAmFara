using IAmFara.Data.Abstractions.Finance;
using Microsoft.EntityFrameworkCore;

namespace IAmFara.Data.SqlServer.Finance;

public class TransactionRepository(FinanceDbContext db) : ITransactionRepository
{
    public Task<Transaction?> GetByIdAsync(Guid householdId, Guid id, CancellationToken cancellationToken = default) =>
        db.Transactions.FirstOrDefaultAsync(t => t.Id == id && t.HouseholdId == householdId, cancellationToken);

    public async Task<IReadOnlyList<Transaction>> GetByHouseholdIdAsync(Guid householdId, TransactionFilter? filter = null, CancellationToken cancellationToken = default)
    {
        var query = db.Transactions.Where(t => t.HouseholdId == householdId);

        if (filter is not null)
        {
            if (filter.FromDate is { } fromDate) query = query.Where(t => t.Date >= fromDate);
            if (filter.ToDate is { } toDate) query = query.Where(t => t.Date <= toDate);
            if (filter.CategoryId is { } categoryId) query = query.Where(t => t.CategoryId == categoryId);
            if (filter.Type is { } type) query = query.Where(t => t.Type == type);
            if (filter.FixedExpenseId is { } fixedExpenseId) query = query.Where(t => t.FixedExpenseId == fixedExpenseId);
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Transaction transaction, CancellationToken cancellationToken = default)
    {
        db.Transactions.Add(transaction);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Transaction transaction, CancellationToken cancellationToken = default)
    {
        db.Transactions.Update(transaction);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid householdId, Guid id, CancellationToken cancellationToken = default)
    {
        var transaction = await GetByIdAsync(householdId, id, cancellationToken);
        if (transaction is null) return;

        db.Transactions.Remove(transaction);
        await db.SaveChangesAsync(cancellationToken);
    }
}
