using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class RemoveCreationMethodField : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreationMethod",
                table: "FactIssueOutcomes");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CreationMethod",
                table: "FactIssueOutcomes",
                type: "integer",
                nullable: true);
        }
    }
}
