using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IAmFara.Data.SqlServer.Migrations.Identity
{
    /// <inheritdoc />
    public partial class AddEmailToInvitations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Email",
                schema: "identity",
                table: "Invitations",
                type: "nvarchar(320)",
                maxLength: 320,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Email",
                schema: "identity",
                table: "Invitations");
        }
    }
}
