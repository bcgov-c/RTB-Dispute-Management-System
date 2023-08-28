using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class AddIsMissingFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsMissingIssueOutcomes",
                table: "FactDisputeSummaries",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsMissingNoticeService",
                table: "FactDisputeSummaries",
                type: "boolean",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsMissingIssueOutcomes",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "IsMissingNoticeService",
                table: "FactDisputeSummaries");
        }
    }
}
