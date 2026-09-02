using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CasaConSi.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAltaConfianzaEvidenceToProfileVerification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CriminalRecordDocumentPath",
                table: "ProfileVerifications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CriminalRecordDocumentUploadedAtUtc",
                table: "ProfileVerifications",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Reference1Name",
                table: "ProfileVerifications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Reference1Phone",
                table: "ProfileVerifications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Reference1Relationship",
                table: "ProfileVerifications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Reference2Name",
                table: "ProfileVerifications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Reference2Phone",
                table: "ProfileVerifications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Reference2Relationship",
                table: "ProfileVerifications",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CriminalRecordDocumentPath",
                table: "ProfileVerifications");

            migrationBuilder.DropColumn(
                name: "CriminalRecordDocumentUploadedAtUtc",
                table: "ProfileVerifications");

            migrationBuilder.DropColumn(
                name: "Reference1Name",
                table: "ProfileVerifications");

            migrationBuilder.DropColumn(
                name: "Reference1Phone",
                table: "ProfileVerifications");

            migrationBuilder.DropColumn(
                name: "Reference1Relationship",
                table: "ProfileVerifications");

            migrationBuilder.DropColumn(
                name: "Reference2Name",
                table: "ProfileVerifications");

            migrationBuilder.DropColumn(
                name: "Reference2Phone",
                table: "ProfileVerifications");

            migrationBuilder.DropColumn(
                name: "Reference2Relationship",
                table: "ProfileVerifications");
        }
    }
}
