using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class UpdateFactDisputeSummaryModel1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AmendRemovedIssues",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "AmendRemovedParticipants",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AmendRemovedIssues",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "AmendRemovedParticipants",
                table: "FactDisputeSummaries");
        }
    }
}
