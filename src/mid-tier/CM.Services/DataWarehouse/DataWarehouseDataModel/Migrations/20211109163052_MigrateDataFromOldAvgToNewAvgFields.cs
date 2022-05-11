using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class MigrateDataFromOldAvgToNewAvgFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AvgNext10DeferredEmptyHearingDays",
                table: "FactTimeStatistics",
                type: "numeric(4,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "AvgNext10EmergEmptyHearingDays",
                table: "FactTimeStatistics",
                type: "numeric(4,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "AvgNext10StandardEmptyHearingDays",
                table: "FactTimeStatistics",
                type: "numeric(4,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.Sql($@"UPDATE public.""FactTimeStatistics""
                    SET ""AvgNext10DeferredEmptyHearingDays""=""AvgNext10DeferredHearingDays""");

            migrationBuilder.Sql($@"UPDATE public.""FactTimeStatistics""
                    SET ""AvgNext10EmergEmptyHearingDays""=""AvgNext10EmergHearingDays""");

            migrationBuilder.Sql($@"UPDATE public.""FactTimeStatistics""
                    SET ""AvgNext10StandardEmptyHearingDays""=""AvgNext10StandardHearingDays""");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
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
    }
}
