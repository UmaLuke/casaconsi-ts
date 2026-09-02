using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CasaConSi.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAdvisoryModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Bio",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AdvisorySessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AdvisorUserId = table.Column<string>(type: "text", nullable: false),
                    ClientUserId = table.Column<string>(type: "text", nullable: false),
                    SessionType = table.Column<int>(type: "integer", nullable: false),
                    ScheduledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Price = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdvisorySessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AdvisorySessions_AspNetUsers_AdvisorUserId",
                        column: x => x.AdvisorUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AdvisorySessions_AspNetUsers_ClientUserId",
                        column: x => x.ClientUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdvisorySessions_AdvisorUserId_ScheduledAt",
                table: "AdvisorySessions",
                columns: new[] { "AdvisorUserId", "ScheduledAt" });

            migrationBuilder.CreateIndex(
                name: "IX_AdvisorySessions_ClientUserId",
                table: "AdvisorySessions",
                column: "ClientUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdvisorySessions");

            migrationBuilder.DropColumn(
                name: "Bio",
                table: "AspNetUsers");
        }
    }
}
