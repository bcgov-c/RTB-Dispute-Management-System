using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class UpdateDisputeHearingsFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DisputeHearingsDeferred",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DisputeHearingsDuty",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DisputeHearingsEmergency",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DisputeHearingsStandard",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EmptyHearingsDeferred",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EmptyHearingsDuty",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EmptyHearingsEmergency",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EmptyHearingsStandard",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NoUrgencyDisputesPaid",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Process7DisputesPaid",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DisputeHearingsDeferred",
                table: "FactTimeStatistics");

            migrationBuilder.DropColumn(
                name: "DisputeHearingsDuty",
                table: "FactTimeStatistics");

            migrationBuilder.DropColumn(
                name: "DisputeHearingsEmergency",
                table: "FactTimeStatistics");

            migrationBuilder.DropColumn(
                name: "DisputeHearingsStandard",
                table: "FactTimeStatistics");

            migrationBuilder.DropColumn(
                name: "EmptyHearingsDeferred",
                table: "FactTimeStatistics");

            migrationBuilder.DropColumn(
                name: "EmptyHearingsDuty",
                table: "FactTimeStatistics");

            migrationBuilder.DropColumn(
                name: "EmptyHearingsEmergency",
                table: "FactTimeStatistics");

            migrationBuilder.DropColumn(
                name: "EmptyHearingsStandard",
                table: "FactTimeStatistics");

            migrationBuilder.DropColumn(
                name: "NoUrgencyDisputesPaid",
                table: "FactTimeStatistics");

            migrationBuilder.DropColumn(
                name: "Process7DisputesPaid",
                table: "FactTimeStatistics");
        }
    }
}
