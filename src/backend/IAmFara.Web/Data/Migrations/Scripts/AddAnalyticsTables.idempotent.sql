IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916124242_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260916124242_InitialCreate', N'8.0.11');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916133006_AddAnalyticsTables'
)
BEGIN
    CREATE TABLE [DailyCountryBreakdowns] (
        [LocalDate] date NOT NULL,
        [CountryCode] nchar(2) NOT NULL,
        [PageViewCount] int NOT NULL,
        [UniqueVisitorCount] int NOT NULL,
        CONSTRAINT [PK_DailyCountryBreakdowns] PRIMARY KEY ([LocalDate], [CountryCode])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916133006_AddAnalyticsTables'
)
BEGIN
    CREATE TABLE [DailyPageBreakdowns] (
        [LocalDate] date NOT NULL,
        [NormalizedPath] nvarchar(200) NOT NULL,
        [PageViewCount] int NOT NULL,
        CONSTRAINT [PK_DailyPageBreakdowns] PRIMARY KEY ([LocalDate], [NormalizedPath])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916133006_AddAnalyticsTables'
)
BEGIN
    CREATE TABLE [DailySummaries] (
        [LocalDate] date NOT NULL,
        [PageViewCount] int NOT NULL,
        [UniqueVisitorCount] int NOT NULL,
        CONSTRAINT [PK_DailySummaries] PRIMARY KEY ([LocalDate])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916133006_AddAnalyticsTables'
)
BEGIN
    CREATE TABLE [ReportRuns] (
        [ReportDate] date NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [AttemptedAtUtc] datetime2 NOT NULL,
        [ResendMessageId] nvarchar(100) NULL,
        [ErrorMessage] nvarchar(500) NULL,
        CONSTRAINT [PK_ReportRuns] PRIMARY KEY ([ReportDate])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916133006_AddAnalyticsTables'
)
BEGIN
    CREATE TABLE [Visits] (
        [Id] bigint NOT NULL IDENTITY,
        [OccurredAtUtc] datetime2 NOT NULL,
        [CountryCode] nchar(2) NOT NULL,
        [NormalizedPath] nvarchar(200) NOT NULL,
        [DailyVisitorKey] nchar(64) NOT NULL,
        CONSTRAINT [PK_Visits] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916133006_AddAnalyticsTables'
)
BEGIN
    CREATE INDEX [IX_Visits_OccurredAtUtc] ON [Visits] ([OccurredAtUtc]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916133006_AddAnalyticsTables'
)
BEGIN
    CREATE INDEX [IX_Visits_OccurredAtUtc_CountryCode] ON [Visits] ([OccurredAtUtc], [CountryCode]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916133006_AddAnalyticsTables'
)
BEGIN
    CREATE INDEX [IX_Visits_OccurredAtUtc_DailyVisitorKey] ON [Visits] ([OccurredAtUtc], [DailyVisitorKey]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916133006_AddAnalyticsTables'
)
BEGIN
    CREATE INDEX [IX_Visits_OccurredAtUtc_NormalizedPath] ON [Visits] ([OccurredAtUtc], [NormalizedPath]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916133006_AddAnalyticsTables'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260916133006_AddAnalyticsTables', N'8.0.11');
END;
GO

COMMIT;
GO

