using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class DeleteTotalDocPrepTimeMin : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TotalDocPrepTimeMin",
                table: "FactDisputeSummaries");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TotalDocPrepTimeMin",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
