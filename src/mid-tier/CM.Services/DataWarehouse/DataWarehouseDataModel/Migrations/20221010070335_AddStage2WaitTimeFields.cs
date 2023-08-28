using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class AddStage2WaitTimeFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Stage2UnassignedDeferred",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Stage2UnassignedStandard",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Stage2UnassignedUrgent",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WaitTimeDaysDeferred",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WaitTimeDaysStandard",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WaitTimeDaysUrgent",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Stage2UnassignedDeferred",
                table: "FactTimeStatistics");

            migrationBuilder.DropColumn(
                name: "Stage2UnassignedStandard",
                table: "FactTimeStatistics");

            migrationBuilder.DropColumn(
                name: "Stage2UnassignedUrgent",
                table: "FactTimeStatistics");

            migrationBuilder.DropColumn(
                name: "WaitTimeDaysDeferred",
                table: "FactTimeStatistics");

            migrationBuilder.DropColumn(
                name: "WaitTimeDaysStandard",
                table: "FactTimeStatistics");

            migrationBuilder.DropColumn(
                name: "WaitTimeDaysUrgent",
                table: "FactTimeStatistics");
        }
    }
}
