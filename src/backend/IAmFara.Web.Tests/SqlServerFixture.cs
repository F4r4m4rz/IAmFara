using IAmFara.Data.SqlServer.Finance;
using IAmFara.Data.SqlServer.Identity;
using IAmFara.Web.Data;
using Microsoft.EntityFrameworkCore;
using Testcontainers.MsSql;

namespace IAmFara.Web.Tests;

/// <summary>
/// A real SQL Server instance via Testcontainers — per the plan's Phase 9
/// ("targeted SQL Server integration tests"), started once per test run
/// (not per test) and shared across the collection below. All three
/// migration sets are applied on startup: this alone catches schema issues
/// SQLite's more permissive model has no equivalent check for (e.g. SQL
/// Server's "multiple cascade paths" restriction, which caught a real bug
/// in FinanceDbContext during this same hardening pass — see
/// FinanceDbContext.cs's comment on Transactions.FixedExpenseId).
/// </summary>
public class SqlServerFixture : IAsyncLifetime
{
    private readonly MsSqlBuilder _builder = new("mcr.microsoft.com/mssql/server:2022-latest");
    private MsSqlContainer _container = null!;

    public string ConnectionString { get; private set; } = "";

    public async Task InitializeAsync()
    {
        _container = _builder.Build();
        await _container.StartAsync();
        ConnectionString = _container.GetConnectionString();

        await using var analyticsDb = new AnalyticsDbContext(
            new DbContextOptionsBuilder<AnalyticsDbContext>().UseSqlServer(ConnectionString).Options);
        await analyticsDb.Database.MigrateAsync();

        await using var identityDb = new IdentityDbContext(
            new DbContextOptionsBuilder<IdentityDbContext>().UseSqlServer(ConnectionString).Options);
        await identityDb.Database.MigrateAsync();

        await using var financeDb = new FinanceDbContext(
            new DbContextOptionsBuilder<FinanceDbContext>().UseSqlServer(ConnectionString).Options);
        await financeDb.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        await _container.DisposeAsync();
    }
}

[CollectionDefinition("SqlServer")]
public class SqlServerCollection : ICollectionFixture<SqlServerFixture>;
