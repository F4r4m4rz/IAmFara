using IAmFara.Data.Abstractions.Finance;
using IAmFara.Data.SqlServer.Finance;
using IAmFara.Finance;
using IAmFara.Finance.Households;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace IAmFara.Web.Tests;

/// <summary>
/// HouseholdFacade security tests per the plan's §7: expired/used/malformed
/// invitation tokens are rejected, a token can't be consumed twice, only an
/// Owner can create an invitation or remove a member, and the last Owner of a
/// household can never be removed — proven against a real SQLite-backed
/// FinanceDbContext, not a fake repository.
/// </summary>
public class HouseholdFacadeTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly FinanceDbContext _db;
    private readonly HouseholdFacade _facade;
    private readonly HouseholdRepository _households;
    private readonly HouseholdMembershipRepository _memberships;
    private readonly HouseholdInvitationRepository _invitations;

    public HouseholdFacadeTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
        var options = new DbContextOptionsBuilder<FinanceDbContext>().UseSqlite(_connection).Options;
        _db = new FinanceDbContext(options);
        _db.Database.EnsureCreated();

        _households = new HouseholdRepository(_db);
        _memberships = new HouseholdMembershipRepository(_db);
        _invitations = new HouseholdInvitationRepository(_db);
        _facade = new HouseholdFacade(_households, _memberships, _invitations);
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    [Fact]
    public async Task GetMyHouseholdsAsync_ReturnsOnlyHouseholdsTheUserBelongsTo()
    {
        var userId = Guid.NewGuid();
        var householdA = await _facade.CreateHouseholdAsync(userId, "A");
        await _facade.CreateHouseholdAsync(Guid.NewGuid(), "B"); // someone else's household

        var results = await _facade.GetMyHouseholdsAsync(userId);

        Assert.Single(results);
        Assert.Equal(householdA.Id, results[0].Household.Id);
        Assert.Equal(HouseholdRole.Owner, results[0].Role);
    }

    [Fact]
    public async Task GetMembersAsync_ByANonMember_ThrowsNotHouseholdMember()
    {
        var household = await _facade.CreateHouseholdAsync(Guid.NewGuid(), "Test");

        await Assert.ThrowsAsync<NotHouseholdMemberException>(() => _facade.GetMembersAsync(Guid.NewGuid(), household.Id));
    }

    [Fact]
    public async Task GetMembersAsync_ReturnsEveryMemberOfTheHousehold()
    {
        var owner = Guid.NewGuid();
        var household = await _facade.CreateHouseholdAsync(owner, "Test");
        var member = Guid.NewGuid();
        await _memberships.AddAsync(new HouseholdMembership { Id = Guid.NewGuid(), UserId = member, HouseholdId = household.Id, Role = HouseholdRole.Member, CreatedAt = DateTimeOffset.UtcNow });

        var results = await _facade.GetMembersAsync(owner, household.Id);

        Assert.Equal(2, results.Count);
    }

    [Fact]
    public async Task CreateHouseholdAsync_MakesTheCreatorAnOwner()
    {
        var creatorId = Guid.NewGuid();

        var household = await _facade.CreateHouseholdAsync(creatorId, "Test Household");

        var membership = await _memberships.GetAsync(creatorId, household.Id);
        Assert.NotNull(membership);
        Assert.Equal(HouseholdRole.Owner, membership!.Role);
    }

    [Fact]
    public async Task CreateInvitationAsync_ByANonMember_ThrowsNotHouseholdOwner()
    {
        var household = await _facade.CreateHouseholdAsync(Guid.NewGuid(), "Test");
        var stranger = Guid.NewGuid();

        await Assert.ThrowsAsync<NotHouseholdOwnerException>(
            () => _facade.CreateInvitationAsync(stranger, household.Id, HouseholdRole.Member, null));
    }

    [Fact]
    public async Task CreateInvitationAsync_ByAMember_ThrowsNotHouseholdOwner()
    {
        var owner = Guid.NewGuid();
        var household = await _facade.CreateHouseholdAsync(owner, "Test");
        var member = Guid.NewGuid();
        await _memberships.AddAsync(new HouseholdMembership { Id = Guid.NewGuid(), UserId = member, HouseholdId = household.Id, Role = HouseholdRole.Member, CreatedAt = DateTimeOffset.UtcNow });

        await Assert.ThrowsAsync<NotHouseholdOwnerException>(
            () => _facade.CreateInvitationAsync(member, household.Id, HouseholdRole.Member, null));
    }

    [Fact]
    public async Task ConsumeInvitationAsync_WithAnUnknownToken_ThrowsInvitationInvalid()
    {
        await Assert.ThrowsAsync<InvitationInvalidException>(
            () => _facade.ConsumeInvitationAsync(Guid.NewGuid(), "not-a-real-token"));
    }

    [Fact]
    public async Task ConsumeInvitationAsync_WithAnExpiredToken_ThrowsInvitationInvalid()
    {
        var owner = Guid.NewGuid();
        var household = await _facade.CreateHouseholdAsync(owner, "Test");
        var (invitation, rawToken) = await _facade.CreateInvitationAsync(owner, household.Id, HouseholdRole.Member, null);
        // Force it into the past directly — CreateInvitationAsync always issues
        // a forward-dated expiry, so this simulates time having passed.
        await _db.HouseholdInvitations
            .Where(i => i.Id == invitation.Id)
            .ExecuteUpdateAsync(s => s.SetProperty(i => i.ExpiresAt, DateTimeOffset.UtcNow.AddDays(-1)));
        // ExecuteUpdateAsync bypasses the change tracker, so without clearing it
        // a subsequent query would return the stale tracked instance from
        // CreateInvitationAsync's own Add() rather than reflecting this update.
        _db.ChangeTracker.Clear();

        await Assert.ThrowsAsync<InvitationInvalidException>(
            () => _facade.ConsumeInvitationAsync(Guid.NewGuid(), rawToken));
    }

    [Fact]
    public async Task ConsumeInvitationAsync_TheSameTokenTwice_FailsTheSecondTime()
    {
        var owner = Guid.NewGuid();
        var household = await _facade.CreateHouseholdAsync(owner, "Test");
        var (_, rawToken) = await _facade.CreateInvitationAsync(owner, household.Id, HouseholdRole.Member);
        var firstRecipient = Guid.NewGuid();
        var secondRecipient = Guid.NewGuid();

        await _facade.ConsumeInvitationAsync(firstRecipient, rawToken);

        await Assert.ThrowsAsync<InvitationInvalidException>(
            () => _facade.ConsumeInvitationAsync(secondRecipient, rawToken));
    }

    [Fact]
    public async Task ConsumeInvitationAsync_JoinsExactlyTheHouseholdTheInvitationNames()
    {
        var owner = Guid.NewGuid();
        var householdA = await _facade.CreateHouseholdAsync(owner, "A");
        await _facade.CreateHouseholdAsync(owner, "B"); // a second household exists, to prove no cross-contamination
        var (_, rawToken) = await _facade.CreateInvitationAsync(owner, householdA.Id, HouseholdRole.Member);
        var recipient = Guid.NewGuid();

        var membership = await _facade.ConsumeInvitationAsync(recipient, rawToken);

        Assert.Equal(householdA.Id, membership.HouseholdId);
    }

    [Fact]
    public async Task RemoveMemberAsync_TheLastOwner_ThrowsCannotRemoveLastOwner()
    {
        var owner = Guid.NewGuid();
        var household = await _facade.CreateHouseholdAsync(owner, "Test");
        var ownerMembership = await _memberships.GetAsync(owner, household.Id);

        await Assert.ThrowsAsync<CannotRemoveLastOwnerException>(
            () => _facade.RemoveMemberAsync(owner, household.Id, ownerMembership!.Id));
    }

    [Fact]
    public async Task RemoveMemberAsync_ANonLastOwner_Succeeds()
    {
        var ownerA = Guid.NewGuid();
        var household = await _facade.CreateHouseholdAsync(ownerA, "Test");
        var ownerB = Guid.NewGuid();
        var ownerBMembership = new HouseholdMembership { Id = Guid.NewGuid(), UserId = ownerB, HouseholdId = household.Id, Role = HouseholdRole.Owner, CreatedAt = DateTimeOffset.UtcNow };
        await _memberships.AddAsync(ownerBMembership);

        await _facade.RemoveMemberAsync(ownerA, household.Id, ownerBMembership.Id);

        Assert.Null(await _memberships.GetAsync(ownerB, household.Id));
    }

    [Fact]
    public async Task RemoveMemberAsync_RepeatedAttemptsOnTheLastOwner_NeverSucceed()
    {
        // Not literal parallel concurrency (SQLite's single connection makes that
        // meaningless to test here) — this proves the invariant the atomic,
        // correlated-subquery DELETE enforces: however many times removal of
        // the sole remaining Owner is attempted, it can never succeed and leave
        // the household without one.
        var owner = Guid.NewGuid();
        var household = await _facade.CreateHouseholdAsync(owner, "Test");
        var ownerMembership = await _memberships.GetAsync(owner, household.Id);

        for (var i = 0; i < 3; i++)
        {
            await Assert.ThrowsAsync<CannotRemoveLastOwnerException>(
                () => _facade.RemoveMemberAsync(owner, household.Id, ownerMembership!.Id));
        }

        Assert.NotNull(await _memberships.GetAsync(owner, household.Id));
    }

    [Fact]
    public async Task RemoveMemberAsync_ByANonOwner_ThrowsNotHouseholdOwner()
    {
        var owner = Guid.NewGuid();
        var household = await _facade.CreateHouseholdAsync(owner, "Test");
        var member = Guid.NewGuid();
        var memberMembership = new HouseholdMembership { Id = Guid.NewGuid(), UserId = member, HouseholdId = household.Id, Role = HouseholdRole.Member, CreatedAt = DateTimeOffset.UtcNow };
        await _memberships.AddAsync(memberMembership);

        await Assert.ThrowsAsync<NotHouseholdOwnerException>(
            () => _facade.RemoveMemberAsync(member, household.Id, memberMembership.Id));
    }

    [Fact]
    public async Task TryJoinFromLinkedIdentityInvitationAsync_WithNoLinkedInvitation_ReturnsNull()
    {
        var membership = await _facade.TryJoinFromLinkedIdentityInvitationAsync(Guid.NewGuid(), Guid.NewGuid());

        Assert.Null(membership);
    }

    [Fact]
    public async Task TryJoinFromLinkedIdentityInvitationAsync_WithALinkedInvitation_JoinsAndConsumesIt()
    {
        var owner = Guid.NewGuid();
        var household = await _facade.CreateHouseholdAsync(owner, "Test");
        var identityInvitationId = Guid.NewGuid();
        var (linkedInvitation, _) = await _facade.CreateInvitationAsync(owner, household.Id, HouseholdRole.Member, identityInvitationId);
        var newUserId = Guid.NewGuid();

        var membership = await _facade.TryJoinFromLinkedIdentityInvitationAsync(newUserId, identityInvitationId);

        Assert.NotNull(membership);
        Assert.Equal(household.Id, membership!.HouseholdId);
        // Consumed: a fresh (untracked) read must show UsedAt set, since
        // TryConsumeAsync's ExecuteUpdateAsync bypasses the change tracker.
        _db.ChangeTracker.Clear();
        var reloaded = await _invitations.GetByTokenHashAsync(linkedInvitation.TokenHash);
        Assert.NotNull(reloaded!.UsedAt);
    }
}
