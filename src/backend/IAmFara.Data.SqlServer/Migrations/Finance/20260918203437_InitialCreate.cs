using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IAmFara.Data.SqlServer.Migrations.Finance
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "finance");

            migrationBuilder.CreateTable(
                name: "Households",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Households", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HouseholdId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    LabelKey = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Categories_Households_HouseholdId",
                        column: x => x.HouseholdId,
                        principalSchema: "finance",
                        principalTable: "Households",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FinancialPeriodSettings",
                schema: "finance",
                columns: table => new
                {
                    HouseholdId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FinancialPeriodStartDay = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinancialPeriodSettings", x => x.HouseholdId);
                    table.ForeignKey(
                        name: "FK_FinancialPeriodSettings_Households_HouseholdId",
                        column: x => x.HouseholdId,
                        principalSchema: "finance",
                        principalTable: "Households",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HouseholdInvitations",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TokenHash = table.Column<byte[]>(type: "varbinary(900)", nullable: false),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UsedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    HouseholdId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IdentityInvitationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HouseholdInvitations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HouseholdInvitations_Households_HouseholdId",
                        column: x => x.HouseholdId,
                        principalSchema: "finance",
                        principalTable: "Households",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HouseholdMemberships",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HouseholdId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HouseholdMemberships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HouseholdMemberships_Households_HouseholdId",
                        column: x => x.HouseholdId,
                        principalSchema: "finance",
                        principalTable: "Households",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FixedMonthlyExpenses",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HouseholdId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DefaultAmountMinor = table.Column<long>(type: "bigint", nullable: false),
                    DueDay = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FixedMonthlyExpenses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FixedMonthlyExpenses_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalSchema: "finance",
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FixedMonthlyExpenses_Households_HouseholdId",
                        column: x => x.HouseholdId,
                        principalSchema: "finance",
                        principalTable: "Households",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FixedExpensePeriodOverrides",
                schema: "finance",
                columns: table => new
                {
                    FixedExpenseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PeriodId = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    AmountMinor = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FixedExpensePeriodOverrides", x => new { x.FixedExpenseId, x.PeriodId });
                    table.ForeignKey(
                        name: "FK_FixedExpensePeriodOverrides_FixedMonthlyExpenses_FixedExpenseId",
                        column: x => x.FixedExpenseId,
                        principalSchema: "finance",
                        principalTable: "FixedMonthlyExpenses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HouseholdId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AmountMinor = table.Column<long>(type: "bigint", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FixedExpenseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transactions_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalSchema: "finance",
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Transactions_FixedMonthlyExpenses_FixedExpenseId",
                        column: x => x.FixedExpenseId,
                        principalSchema: "finance",
                        principalTable: "FixedMonthlyExpenses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Transactions_Households_HouseholdId",
                        column: x => x.HouseholdId,
                        principalSchema: "finance",
                        principalTable: "Households",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_HouseholdId",
                schema: "finance",
                table: "Categories",
                column: "HouseholdId");

            migrationBuilder.CreateIndex(
                name: "IX_FixedMonthlyExpenses_CategoryId",
                schema: "finance",
                table: "FixedMonthlyExpenses",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_FixedMonthlyExpenses_HouseholdId",
                schema: "finance",
                table: "FixedMonthlyExpenses",
                column: "HouseholdId");

            migrationBuilder.CreateIndex(
                name: "IX_HouseholdInvitations_HouseholdId",
                schema: "finance",
                table: "HouseholdInvitations",
                column: "HouseholdId");

            migrationBuilder.CreateIndex(
                name: "IX_HouseholdInvitations_TokenHash",
                schema: "finance",
                table: "HouseholdInvitations",
                column: "TokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HouseholdMemberships_HouseholdId",
                schema: "finance",
                table: "HouseholdMemberships",
                column: "HouseholdId");

            migrationBuilder.CreateIndex(
                name: "IX_HouseholdMemberships_UserId_HouseholdId",
                schema: "finance",
                table: "HouseholdMemberships",
                columns: new[] { "UserId", "HouseholdId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_CategoryId",
                schema: "finance",
                table: "Transactions",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_FixedExpenseId",
                schema: "finance",
                table: "Transactions",
                column: "FixedExpenseId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_HouseholdId_Date",
                schema: "finance",
                table: "Transactions",
                columns: new[] { "HouseholdId", "Date" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FinancialPeriodSettings",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "FixedExpensePeriodOverrides",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "HouseholdInvitations",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "HouseholdMemberships",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "Transactions",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "FixedMonthlyExpenses",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "Categories",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "Households",
                schema: "finance");
        }
    }
}
