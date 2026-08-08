using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CasaConSi.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTrustVerification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDemoUser",
                table: "AspNetUsers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MembershipTier",
                table: "AspNetUsers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ProfileVerifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    IdentityVerified = table.Column<bool>(type: "boolean", nullable: false),
                    ContactVerified = table.Column<bool>(type: "boolean", nullable: false),
                    SocialMediaVerified = table.Column<bool>(type: "boolean", nullable: false),
                    CreditStatusVerified = table.Column<bool>(type: "boolean", nullable: false),
                    ProofOfStatusVerified = table.Column<bool>(type: "boolean", nullable: false),
                    SwornDeclarationAccepted = table.Column<bool>(type: "boolean", nullable: false),
                    PersonalReferencesVerified = table.Column<bool>(type: "boolean", nullable: false),
                    VirtualInterviewCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    CriminalRecordVerified = table.Column<bool>(type: "boolean", nullable: false),
                    CohabitationHistoryVerified = table.Column<bool>(type: "boolean", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfileVerifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProfileVerifications_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProfileVerifications_UserId",
                table: "ProfileVerifications",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProfileVerifications");

            migrationBuilder.DropColumn(
                name: "IsDemoUser",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "MembershipTier",
                table: "AspNetUsers");
        }
    }
}
