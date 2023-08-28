using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class AddFactDisputeSummaryFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CaseManagedTimeMin",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsMissingResolutionTime",
                table: "FactDisputeSummaries",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NoticeNotServed",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CaseManagedTimeMin",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "IsMissingResolutionTime",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "NoticeNotServed",
                table: "FactDisputeSummaries");
        }
    }
}
