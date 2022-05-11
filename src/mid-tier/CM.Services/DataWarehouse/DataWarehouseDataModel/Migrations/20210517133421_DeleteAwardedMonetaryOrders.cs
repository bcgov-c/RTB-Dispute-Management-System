using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class DeleteAwardedMonetaryOrders : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AwardedMonetaryOrders",
                table: "FactDisputeSummaries");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AwardedMonetaryOrders",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
