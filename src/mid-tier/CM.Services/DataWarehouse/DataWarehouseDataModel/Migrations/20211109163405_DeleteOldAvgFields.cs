using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class DeleteOldAvgFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvgNext10DeferredHearingDays",
                table: "FactTimeStatistics");

            migrationBuilder.DropColumn(
                name: "AvgNext10EmergHearingDays",
                table: "FactTimeStatistics");

            migrationBuilder.DropColumn(
                name: "AvgNext10StandardHearingDays",
                table: "FactTimeStatistics");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AvgNext10DeferredHearingDays",
                table: "FactTimeStatistics",
                type: "numeric(4,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "AvgNext10EmergHearingDays",
                table: "FactTimeStatistics",
                type: "numeric(4,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "AvgNext10StandardHearingDays",
                table: "FactTimeStatistics",
                type: "numeric(4,2)",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
