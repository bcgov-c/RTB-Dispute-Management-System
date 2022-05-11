using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class RenameAwardedMonetaryOrdersToAwardedMonetaryIssues : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AwardedMonetaryIssues",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.Sql($@"UPDATE public.""FactDisputeSummaries""
                    SET ""AwardedMonetaryIssues""=""AwardedMonetaryOrders""");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AwardedMonetaryIssues",
                table: "FactDisputeSummaries");
        }
    }
}
