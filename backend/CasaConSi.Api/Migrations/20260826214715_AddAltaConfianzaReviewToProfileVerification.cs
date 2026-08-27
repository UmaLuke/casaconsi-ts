using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CasaConSi.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAltaConfianzaReviewToProfileVerification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AltaConfianzaRejectionReason",
                table: "ProfileVerifications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AltaConfianzaRequestedAtUtc",
                table: "ProfileVerifications",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AltaConfianzaReviewedAtUtc",
                table: "ProfileVerifications",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AltaConfianzaReviewedByUserId",
                table: "ProfileVerifications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AltaConfianzaStatus",
                table: "ProfileVerifications",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ProfileVerifications_AltaConfianzaStatus",
                table: "ProfileVerifications",
                column: "AltaConfianzaStatus");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProfileVerifications_AltaConfianzaStatus",
                table: "ProfileVerifications");

            migrationBuilder.DropColumn(
                name: "AltaConfianzaRejectionReason",
                table: "ProfileVerifications");

            migrationBuilder.DropColumn(
                name: "AltaConfianzaRequestedAtUtc",
                table: "ProfileVerifications");

            migrationBuilder.DropColumn(
                name: "AltaConfianzaReviewedAtUtc",
                table: "ProfileVerifications");

            migrationBuilder.DropColumn(
                name: "AltaConfianzaReviewedByUserId",
                table: "ProfileVerifications");

            migrationBuilder.DropColumn(
                name: "AltaConfianzaStatus",
                table: "ProfileVerifications");
        }
    }
}
