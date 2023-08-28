using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class FixFieldName : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "RemedySubtatus",
                table: "FactIssueOutcomes",
                newName: "RemedySubStatus");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "RemedySubStatus",
                table: "FactIssueOutcomes",
                newName: "RemedySubtatus");
        }
    }
}
