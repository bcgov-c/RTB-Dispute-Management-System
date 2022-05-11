using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class RemoveStatusDecisionsReadyToSend : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StatusDecisionsReadyToSend",
                table: "FactTimeStatistics");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "StatusDecisionsReadyToSend",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
