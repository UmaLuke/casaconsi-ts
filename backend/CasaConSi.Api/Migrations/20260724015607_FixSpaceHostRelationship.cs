using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CasaConSi.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixSpaceHostRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Spaces_AspNetUsers_HostId",
                table: "Spaces");

            migrationBuilder.DropIndex(
                name: "IX_Spaces_HostId",
                table: "Spaces");

            migrationBuilder.DropColumn(
                name: "HostId",
                table: "Spaces");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HostId",
                table: "Spaces",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Spaces_HostId",
                table: "Spaces",
                column: "HostId");

            migrationBuilder.AddForeignKey(
                name: "FK_Spaces_AspNetUsers_HostId",
                table: "Spaces",
                column: "HostId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
