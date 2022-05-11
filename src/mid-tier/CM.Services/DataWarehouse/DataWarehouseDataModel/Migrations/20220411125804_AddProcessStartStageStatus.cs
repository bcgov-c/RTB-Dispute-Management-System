using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class AddProcessStartStageStatus : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProcessStartStage",
                table: "FactIntakeProcessings",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ProcessStartStatus",
                table: "FactIntakeProcessings",
                type: "integer",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProcessStartStage",
                table: "FactIntakeProcessings");

            migrationBuilder.DropColumn(
                name: "ProcessStartStatus",
                table: "FactIntakeProcessings");
        }
    }
}
