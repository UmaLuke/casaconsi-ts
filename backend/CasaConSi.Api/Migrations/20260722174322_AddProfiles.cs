using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CasaConSi.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddProfiles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HostProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    EncryptedDni = table.Column<string>(type: "text", nullable: false),
                    PreferredTenantGeneration = table.Column<string>(type: "text", nullable: false),
                    Neighborhood = table.Column<string>(type: "text", nullable: false),
                    ExpectedAmountRangeArs = table.Column<string>(type: "text", nullable: false),
                    AvailableRooms = table.Column<int>(type: "integer", nullable: false),
                    HousingType = table.Column<string>(type: "text", nullable: false),
                    ProfilePhotoPath = table.Column<string>(type: "text", nullable: true),
                    PresentationMediaPath = table.Column<string>(type: "text", nullable: true),
                    HomePhotoPaths = table.Column<List<string>>(type: "text[]", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExchangesExpected = table.Column<string>(type: "jsonb", nullable: false),
                    Habits = table.Column<string>(type: "jsonb", nullable: false),
                    Health = table.Column<string>(type: "jsonb", nullable: false),
                    HousingData = table.Column<string>(type: "jsonb", nullable: false),
                    PersonalData = table.Column<string>(type: "jsonb", nullable: false),
                    PersonalPresentation = table.Column<string>(type: "jsonb", nullable: false),
                    TenantPreferences = table.Column<string>(type: "jsonb", nullable: false),
                    WorkSituation = table.Column<string>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HostProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HostProfiles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StudentProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    EncryptedDni = table.Column<string>(type: "text", nullable: false),
                    PreferredHostGeneration = table.Column<string>(type: "text", nullable: false),
                    PreferredNeighborhoods = table.Column<List<string>>(type: "text[]", nullable: false),
                    ContributionRangeArs = table.Column<string>(type: "text", nullable: false),
                    AvailableFrom = table.Column<DateOnly>(type: "date", nullable: true),
                    StayDuration = table.Column<string>(type: "text", nullable: false),
                    ProfilePhotoPath = table.Column<string>(type: "text", nullable: true),
                    PresentationMediaPath = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EconomicSituation = table.Column<string>(type: "jsonb", nullable: false),
                    ExchangesOffered = table.Column<string>(type: "jsonb", nullable: false),
                    Habits = table.Column<string>(type: "jsonb", nullable: false),
                    Health = table.Column<string>(type: "jsonb", nullable: false),
                    HostPreferences = table.Column<string>(type: "jsonb", nullable: false),
                    LocationPreferences = table.Column<string>(type: "jsonb", nullable: false),
                    PersonalData = table.Column<string>(type: "jsonb", nullable: false),
                    PersonalPresentation = table.Column<string>(type: "jsonb", nullable: false),
                    TravelReason = table.Column<string>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentProfiles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HostProfiles_PreferredTenantGeneration",
                table: "HostProfiles",
                column: "PreferredTenantGeneration");

            migrationBuilder.CreateIndex(
                name: "IX_HostProfiles_UserId",
                table: "HostProfiles",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StudentProfiles_PreferredHostGeneration",
                table: "StudentProfiles",
                column: "PreferredHostGeneration");

            migrationBuilder.CreateIndex(
                name: "IX_StudentProfiles_UserId",
                table: "StudentProfiles",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HostProfiles");

            migrationBuilder.DropTable(
                name: "StudentProfiles");
        }
    }
}
