using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class CheckSpellingIssueFix : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TimeIOAssignedMin",
                table: "FactIntakeProcessings",
                newName: "TimeIoAssignedMin");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TimeIoAssignedMin",
                table: "FactIntakeProcessings",
                newName: "TimeIOAssignedMin");
        }
    }
}
