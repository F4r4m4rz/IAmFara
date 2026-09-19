using IAmFara.Data.Abstractions.Identity;
using IAmFara.Data.SqlServer.Identity;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace IAmFara.Web.Tests;

/// <summary>
/// Persistence tests for IdentityDbContext against a SQLite in-memory database,
/// matching the AnalyticsReportServiceTests pattern: a real EF Core provider
/// exercising the actual schema (constraints, indexes, delete behaviors)
/// rather than a fake/in-memory repository.
/// </summary>
public class IdentityPersistenceTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly IdentityDbContext _db;
    private readonly UserRepository _users;
    private readonly PasskeyCredentialRepository _passkeyCredentials;
    private readonly InvitationRepository _invitations;

    public IdentityPersistenceTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<IdentityDbContext>()
            .UseSqlite(_connection)
            .Options;

        _db = new IdentityDbContext(options);
        _db.Database.EnsureCreated();

        _users = new UserRepository(_db);
        _passkeyCredentials = new PasskeyCredentialRepository(_db);
        _invitations = new InvitationRepository(_db);
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    private static User NewUser(string email = "user@example.com") => new()
    {
        Id = Guid.NewGuid(),
        DisplayName = "Test User",
        Email = email,
        CreatedAt = DateTimeOffset.UtcNow,
    };

    [Fact]
    public async Task AddAsync_ThenGetById_ReturnsTheSameUser()
    {
        var user = NewUser();

        await _users.AddAsync(user);
        var found = await _users.GetByIdAsync(user.Id);

        Assert.NotNull(found);
        Assert.Equal(user.Email, found!.Email);
    }

    [Fact]
    public async Task GetByEmailAsync_WithNoMatch_ReturnsNull()
    {
        var found = await _users.GetByEmailAsync("nobody@example.com");

        Assert.Null(found);
    }

    [Fact]
    public async Task PasskeyCredential_DuplicateCredentialId_ViolatesUniqueConstraint()
    {
        var user = NewUser();
        await _users.AddAsync(user);

        var credentialId = new byte[] { 1, 2, 3 };
        await _passkeyCredentials.AddAsync(new PasskeyCredential
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            CredentialId = credentialId,
            PublicKey = [4, 5, 6],
            CreatedAt = DateTimeOffset.UtcNow,
        });

        var duplicate = new PasskeyCredential
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            CredentialId = credentialId,
            PublicKey = [7, 8, 9],
            CreatedAt = DateTimeOffset.UtcNow,
        };

        await Assert.ThrowsAsync<DbUpdateException>(() => _passkeyCredentials.AddAsync(duplicate));
    }

    [Fact]
    public async Task PasskeyCredential_GetByUserId_OnlyReturnsThatUsersCredentials()
    {
        var userA = NewUser("a@example.com");
        var userB = NewUser("b@example.com");
        await _users.AddAsync(userA);
        await _users.AddAsync(userB);

        await _passkeyCredentials.AddAsync(new PasskeyCredential
        {
            Id = Guid.NewGuid(),
            UserId = userA.Id,
            CredentialId = [1],
            PublicKey = [1],
            CreatedAt = DateTimeOffset.UtcNow,
        });
        await _passkeyCredentials.AddAsync(new PasskeyCredential
        {
            Id = Guid.NewGuid(),
            UserId = userB.Id,
            CredentialId = [2],
            PublicKey = [2],
            CreatedAt = DateTimeOffset.UtcNow,
        });

        var userACredentials = await _passkeyCredentials.GetByUserIdAsync(userA.Id);

        Assert.Single(userACredentials);
        Assert.Equal(userA.Id, userACredentials[0].UserId);
    }

    [Fact]
    public async Task PasskeyCredential_UpdateSignCount_PersistsTheNewValue()
    {
        var user = NewUser();
        await _users.AddAsync(user);
        var credential = new PasskeyCredential
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            CredentialId = [1],
            PublicKey = [1],
            SignCount = 1,
            CreatedAt = DateTimeOffset.UtcNow,
        };
        await _passkeyCredentials.AddAsync(credential);
        _db.ChangeTracker.Clear();

        await _passkeyCredentials.UpdateSignCountAsync(credential.Id, 42);

        var reloaded = await _passkeyCredentials.GetByCredentialIdAsync([1]);
        Assert.Equal(42u, reloaded!.SignCount);
    }

    [Fact]
    public async Task Invitation_DuplicateTokenHash_ViolatesUniqueConstraint()
    {
        var tokenHash = new byte[] { 9, 9, 9 };
        await _invitations.AddAsync(new Invitation
        {
            Id = Guid.NewGuid(),
            TokenHash = tokenHash,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(1),
            CreatedAt = DateTimeOffset.UtcNow,
        });

        var duplicate = new Invitation
        {
            Id = Guid.NewGuid(),
            TokenHash = tokenHash,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(1),
            CreatedAt = DateTimeOffset.UtcNow,
        };

        await Assert.ThrowsAsync<DbUpdateException>(() => _invitations.AddAsync(duplicate));
    }

    [Fact]
    public async Task Invitation_TryConsumeAsync_FirstCallSucceeds_SecondCallFails()
    {
        var invitation = new Invitation
        {
            Id = Guid.NewGuid(),
            TokenHash = [1, 2, 3],
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(1),
            CreatedAt = DateTimeOffset.UtcNow,
        };
        await _invitations.AddAsync(invitation);

        var firstAttempt = await _invitations.TryConsumeAsync(invitation.Id, DateTimeOffset.UtcNow);
        var secondAttempt = await _invitations.TryConsumeAsync(invitation.Id, DateTimeOffset.UtcNow);

        Assert.True(firstAttempt);
        Assert.False(secondAttempt);
    }

    [Fact]
    public async Task Invitation_TryConsumeAsync_UnknownId_ReturnsFalse()
    {
        var result = await _invitations.TryConsumeAsync(Guid.NewGuid(), DateTimeOffset.UtcNow);

        Assert.False(result);
    }

    [Fact]
    public async Task Invitation_TryConsumeAsync_AfterExpiry_ReturnsFalseEvenThoughStillUnused()
    {
        // The atomic consume condition must include expiry, not just UsedAt
        // == null — otherwise a registration ceremony that runs long enough
        // (up to the challenge TTL) could consume an invitation that expired
        // in the meantime, since a separate, earlier expiry check (at
        // ceremony begin) can't close that window on its own.
        var invitation = new Invitation
        {
            Id = Guid.NewGuid(),
            TokenHash = [4, 5, 6],
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(-1),
            CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-10),
        };
        await _invitations.AddAsync(invitation);

        var result = await _invitations.TryConsumeAsync(invitation.Id, DateTimeOffset.UtcNow);

        Assert.False(result);
    }

    [Fact]
    public async Task PasskeyCredential_UserDeletion_IsRestrictedWhileCredentialExists()
    {
        var user = NewUser();
        await _users.AddAsync(user);
        await _passkeyCredentials.AddAsync(new PasskeyCredential
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            CredentialId = [7],
            PublicKey = [7],
            CreatedAt = DateTimeOffset.UtcNow,
        });
        _db.ChangeTracker.Clear();

        _db.Users.Remove((await _users.GetByIdAsync(user.Id))!);

        await Assert.ThrowsAsync<DbUpdateException>(() => _db.SaveChangesAsync());
    }

    [Fact]
    public async Task Invitation_CreatedByUserId_SetsNullWhenCreatorIsDeleted()
    {
        var creator = NewUser();
        await _users.AddAsync(creator);
        var invitation = new Invitation
        {
            Id = Guid.NewGuid(),
            TokenHash = [4, 5, 6],
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(1),
            CreatedByUserId = creator.Id,
            CreatedAt = DateTimeOffset.UtcNow,
        };
        await _invitations.AddAsync(invitation);
        _db.ChangeTracker.Clear();

        _db.Users.Remove((await _users.GetByIdAsync(creator.Id))!);
        await _db.SaveChangesAsync();
        _db.ChangeTracker.Clear();

        var reloaded = await _invitations.GetByTokenHashAsync([4, 5, 6]);
        Assert.Null(reloaded!.CreatedByUserId);
    }
}
