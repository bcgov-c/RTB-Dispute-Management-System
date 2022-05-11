using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class UpdateFactDisputeSummaryModel : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TotalPreparationTimeMin",
                table: "FactDisputeSummaries",
                newName: "TotalHearingPrepTimeMin");

            migrationBuilder.AddColumn<int>(
                name: "TotalDocPrepTimeMin",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TotalDocPrepTimeMin",
                table: "FactDisputeSummaries");

            migrationBuilder.RenameColumn(
                name: "TotalHearingPrepTimeMin",
                table: "FactDisputeSummaries",
                newName: "TotalPreparationTimeMin");
        }
    }
}
