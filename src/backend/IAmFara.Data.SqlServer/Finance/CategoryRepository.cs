using IAmFara.Data.Abstractions.Finance;
using Microsoft.EntityFrameworkCore;

namespace IAmFara.Data.SqlServer.Finance;

public class CategoryRepository(FinanceDbContext db) : ICategoryRepository
{
    public Task<Category?> GetByIdAsync(Guid householdId, Guid id, CancellationToken cancellationToken = default) =>
        db.Categories.FirstOrDefaultAsync(c => c.Id == id && c.HouseholdId == householdId, cancellationToken);

    public async Task<IReadOnlyList<Category>> GetByHouseholdIdAsync(Guid householdId, CancellationToken cancellationToken = default) =>
        await db.Categories.Where(c => c.HouseholdId == householdId).ToListAsync(cancellationToken);

    public async Task AddAsync(Category category, CancellationToken cancellationToken = default)
    {
        db.Categories.Add(category);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Category category, CancellationToken cancellationToken = default)
    {
        db.Categories.Update(category);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid householdId, Guid id, CancellationToken cancellationToken = default)
    {
        var category = await GetByIdAsync(householdId, id, cancellationToken);
        if (category is null) return;

        db.Categories.Remove(category);
        await db.SaveChangesAsync(cancellationToken);
    }
}
