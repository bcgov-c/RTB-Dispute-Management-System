using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AddHearingIndexes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Hearings_LocalStartDateTime_LocalEndDateTime",
                table: "Hearings",
                columns: new[] { "LocalStartDateTime", "LocalEndDateTime" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Hearings_LocalStartDateTime_LocalEndDateTime",
                table: "Hearings");
        }
    }
}
