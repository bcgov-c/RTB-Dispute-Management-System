using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class UpdateFactTimeStatisticsFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "AvgNext10StandardHearingDays",
                table: "FactTimeStatistics",
                type: "numeric(4,2)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<decimal>(
                name: "AvgNext10EmergHearingDays",
                table: "FactTimeStatistics",
                type: "numeric(4,2)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<decimal>(
                name: "AvgNext10DeferredHearingDays",
                table: "FactTimeStatistics",
                type: "numeric(4,2)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "AvgNext10StandardHearingDays",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(4,2)");

            migrationBuilder.AlterColumn<int>(
                name: "AvgNext10EmergHearingDays",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(4,2)");

            migrationBuilder.AlterColumn<int>(
                name: "AvgNext10DeferredHearingDays",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(4,2)");
        }
    }
}
