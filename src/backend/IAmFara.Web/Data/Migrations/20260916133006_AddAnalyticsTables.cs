using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IAmFara.Web.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAnalyticsTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DailyCountryBreakdowns",
                columns: table => new
                {
                    LocalDate = table.Column<DateOnly>(type: "date", nullable: false),
                    CountryCode = table.Column<string>(type: "nchar(2)", fixedLength: true, maxLength: 2, nullable: false),
                    PageViewCount = table.Column<int>(type: "int", nullable: false),
                    UniqueVisitorCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyCountryBreakdowns", x => new { x.LocalDate, x.CountryCode });
                });

            migrationBuilder.CreateTable(
                name: "DailyPageBreakdowns",
                columns: table => new
                {
                    LocalDate = table.Column<DateOnly>(type: "date", nullable: false),
                    NormalizedPath = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PageViewCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyPageBreakdowns", x => new { x.LocalDate, x.NormalizedPath });
                });

            migrationBuilder.CreateTable(
                name: "DailySummaries",
                columns: table => new
                {
                    LocalDate = table.Column<DateOnly>(type: "date", nullable: false),
                    PageViewCount = table.Column<int>(type: "int", nullable: false),
                    UniqueVisitorCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailySummaries", x => x.LocalDate);
                });

            migrationBuilder.CreateTable(
                name: "ReportRuns",
                columns: table => new
                {
                    ReportDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AttemptedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ResendMessageId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ErrorMessage = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportRuns", x => x.ReportDate);
                });

            migrationBuilder.CreateTable(
                name: "Visits",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OccurredAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CountryCode = table.Column<string>(type: "nchar(2)", fixedLength: true, maxLength: 2, nullable: false),
                    NormalizedPath = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DailyVisitorKey = table.Column<string>(type: "nchar(64)", fixedLength: true, maxLength: 64, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Visits", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Visits_OccurredAtUtc",
                table: "Visits",
                column: "OccurredAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_Visits_OccurredAtUtc_CountryCode",
                table: "Visits",
                columns: new[] { "OccurredAtUtc", "CountryCode" });

            migrationBuilder.CreateIndex(
                name: "IX_Visits_OccurredAtUtc_DailyVisitorKey",
                table: "Visits",
                columns: new[] { "OccurredAtUtc", "DailyVisitorKey" });

            migrationBuilder.CreateIndex(
                name: "IX_Visits_OccurredAtUtc_NormalizedPath",
                table: "Visits",
                columns: new[] { "OccurredAtUtc", "NormalizedPath" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DailyCountryBreakdowns");

            migrationBuilder.DropTable(
                name: "DailyPageBreakdowns");

            migrationBuilder.DropTable(
                name: "DailySummaries");

            migrationBuilder.DropTable(
                name: "ReportRuns");

            migrationBuilder.DropTable(
                name: "Visits");
        }
    }
}
