using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class UpdateAvgNext10Fields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "AvgNext10StandardEmptyHearingDays",
                table: "FactTimeStatistics",
                type: "numeric(6,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(4,2)");

            migrationBuilder.AlterColumn<decimal>(
                name: "AvgNext10EmergEmptyHearingDays",
                table: "FactTimeStatistics",
                type: "numeric(6,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(4,2)");

            migrationBuilder.AlterColumn<decimal>(
                name: "AvgNext10DeferredEmptyHearingDays",
                table: "FactTimeStatistics",
                type: "numeric(6,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(4,2)");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "AvgNext10StandardEmptyHearingDays",
                table: "FactTimeStatistics",
                type: "numeric(4,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(6,2)");

            migrationBuilder.AlterColumn<decimal>(
                name: "AvgNext10EmergEmptyHearingDays",
                table: "FactTimeStatistics",
                type: "numeric(4,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(6,2)");

            migrationBuilder.AlterColumn<decimal>(
                name: "AvgNext10DeferredEmptyHearingDays",
                table: "FactTimeStatistics",
                type: "numeric(4,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(6,2)");
        }
    }
}
