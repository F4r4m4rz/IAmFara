using System.Net;
using System.Net.Http.Json;
using IAmFara.Data.Abstractions.Finance;
using IAmFara.Data.SqlServer.Finance;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace IAmFara.Web.Tests;

/// <summary>
/// Cross-household isolation at the full HTTP stack, per the plan's §5/§7 —
/// treated as a critical defect to prevent, not an edge case. A user who is a
/// member only of Household A must never be able to read or write Household
/// B's finance data through the API, even by guessing/knowing a real
/// transaction id that belongs to B.
/// </summary>
public class FinanceEndpointTests : IClassFixture<AuthenticationTestFactory>
{
    private readonly AuthenticationTestFactory _factory;

    public FinanceEndpointTests(AuthenticationTestFactory factory)
    {
        _factory = factory;
    }

    private HttpClient CreateClient() => _factory.CreateClient(new WebApplicationFactoryClientOptions
    {
        BaseAddress = new Uri("https://localhost"),
    });

    private record CsrfTokenResponse(string Token);

    private static async Task<HttpResponseMessage> SendAuthenticatedAsync(HttpClient client, Guid userId, HttpMethod method, string path, object? body = null)
    {
        client.DefaultRequestHeaders.Remove(TestAuthHandler.UserIdHeader);
        client.DefaultRequestHeaders.Add(TestAuthHandler.UserIdHeader, userId.ToString());

        var tokenResponse = await client.GetAsync("/api/auth/csrf-token");
        var token = (await tokenResponse.Content.ReadFromJsonAsync<CsrfTokenResponse>())!.Token;
        var setCookie = tokenResponse.Headers.GetValues("Set-Cookie").First().Split(';')[0];

        using var request = new HttpRequestMessage(method, path);
        if (body is not null) request.Content = JsonContent.Create(body);
        request.Headers.Add("Cookie", setCookie);
        request.Headers.Add("X-CSRF-TOKEN", token);

        return await client.SendAsync(request);
    }

    /// <summary>Seeds a household with the given member, directly via FinanceDbContext (bypassing HTTP, since this is test setup, not the thing under test).</summary>
    private async Task<Guid> SeedHouseholdWithMemberAsync(Guid userId)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<FinanceDbContext>();
        var householdId = Guid.NewGuid();
        db.Households.Add(new Household { Id = householdId, Name = "Test", CreatedAt = DateTimeOffset.UtcNow });
        db.HouseholdMemberships.Add(new HouseholdMembership { Id = Guid.NewGuid(), UserId = userId, HouseholdId = householdId, Role = HouseholdRole.Member, CreatedAt = DateTimeOffset.UtcNow });
        await db.SaveChangesAsync();
        return householdId;
    }

    private async Task<Guid> SeedCategoryAsync(Guid householdId, TransactionType type = TransactionType.Expense)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<FinanceDbContext>();
        var category = new Category { Id = Guid.NewGuid(), HouseholdId = householdId, Type = type, Name = "Groceries", CreatedAt = DateTimeOffset.UtcNow };
        db.Categories.Add(category);
        await db.SaveChangesAsync();
        return category.Id;
    }

    private async Task<Guid> SeedTransactionAsync(Guid householdId, Guid categoryId)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<FinanceDbContext>();
        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            HouseholdId = householdId,
            Type = TransactionType.Expense,
            AmountMinor = 1000,
            Date = new DateOnly(2026, 1, 1),
            CategoryId = categoryId,
            CreatedByUserId = Guid.NewGuid(),
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };
        db.Transactions.Add(transaction);
        await db.SaveChangesAsync();
        return transaction.Id;
    }

    [Fact]
    public async Task GetTransactions_ForAHouseholdTheUserIsNotAMemberOf_ReturnsForbidden()
    {
        var userId = Guid.NewGuid();
        await SeedHouseholdWithMemberAsync(userId); // member of some OTHER household
        var otherHouseholdId = await SeedHouseholdWithMemberAsync(Guid.NewGuid()); // not a member of this one
        var client = CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthHandler.UserIdHeader, userId.ToString());

        var response = await client.GetAsync($"/api/households/{otherHouseholdId}/transactions");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetTransactionById_ForATransactionBelongingToAnotherHousehold_ReturnsForbiddenNotTheTransaction()
    {
        var ownerId = Guid.NewGuid();
        var householdA = await SeedHouseholdWithMemberAsync(ownerId);
        var categoryA = await SeedCategoryAsync(householdA);
        var transactionAId = await SeedTransactionAsync(householdA, categoryA);

        var strangerId = Guid.NewGuid();
        var householdB = await SeedHouseholdWithMemberAsync(strangerId);
        var client = CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthHandler.UserIdHeader, strangerId.ToString());

        // The stranger is a member of B, but tries to read A's transaction by
        // requesting it through B's own route — must never leak A's data.
        var response = await client.GetAsync($"/api/households/{householdB}/transactions/{transactionAId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteTransaction_ForAHouseholdTheUserIsNotAMemberOf_ReturnsForbiddenAndDoesNotDelete()
    {
        var ownerId = Guid.NewGuid();
        var householdA = await SeedHouseholdWithMemberAsync(ownerId);
        var categoryA = await SeedCategoryAsync(householdA);
        var transactionAId = await SeedTransactionAsync(householdA, categoryA);

        var strangerId = Guid.NewGuid();
        var client = CreateClient();

        var response = await SendAuthenticatedAsync(client, strangerId, HttpMethod.Delete, $"/api/households/{householdA}/transactions/{transactionAId}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);

        // Confirm it's genuinely still there, not just that the HTTP call was rejected.
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<FinanceDbContext>();
        Assert.NotNull(await db.Transactions.FindAsync(transactionAId));
    }

    [Fact]
    public async Task AddTransaction_ToAHouseholdTheUserIsNotAMemberOf_ReturnsForbidden()
    {
        var strangerId = Guid.NewGuid();
        var otherHouseholdId = await SeedHouseholdWithMemberAsync(Guid.NewGuid());
        var client = CreateClient();

        var response = await SendAuthenticatedAsync(client, strangerId, HttpMethod.Post, $"/api/households/{otherHouseholdId}/transactions", new
        {
            type = "expense",
            amountMinor = 500,
            date = "2026-01-01",
            categoryId = Guid.NewGuid().ToString(),
        });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetCategories_ForAMemberHousehold_ReturnsOnlyThatHouseholdsCategories()
    {
        var userId = Guid.NewGuid();
        var householdA = await SeedHouseholdWithMemberAsync(userId);
        await SeedCategoryAsync(householdA);
        var householdB = await SeedHouseholdWithMemberAsync(Guid.NewGuid());
        await SeedCategoryAsync(householdB);
        var client = CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthHandler.UserIdHeader, userId.ToString());

        var response = await client.GetAsync($"/api/households/{householdA}/categories");
        var categories = await response.Content.ReadFromJsonAsync<List<System.Text.Json.JsonElement>>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Single(categories!);
    }
}
