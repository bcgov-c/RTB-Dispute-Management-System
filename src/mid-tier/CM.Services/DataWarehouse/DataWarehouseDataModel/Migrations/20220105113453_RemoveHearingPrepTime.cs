using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class RemoveHearingPrepTime : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HearingPrepTime",
                table: "FactHearingSummaries");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "HearingPrepTime",
                table: "FactHearingSummaries",
                type: "integer",
                nullable: true);
        }
    }
}
