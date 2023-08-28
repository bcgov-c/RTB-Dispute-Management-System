using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class AddArsFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ParticipatoryMissArsDeadline",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ParticipatoryMissReinstateDeadline",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ParticipatoryWaitArsDeadline",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ParticipatoryWaitReinstateDeadline",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "HasArsDeadline",
                table: "FactIntakeProcessings",
                type: "boolean",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ParticipatoryMissArsDeadline",
                table: "FactTimeStatistics");

            migrationBuilder.DropColumn(
                name: "ParticipatoryMissReinstateDeadline",
                table: "FactTimeStatistics");

            migrationBuilder.DropColumn(
                name: "ParticipatoryWaitArsDeadline",
                table: "FactTimeStatistics");

            migrationBuilder.DropColumn(
                name: "ParticipatoryWaitReinstateDeadline",
                table: "FactTimeStatistics");

            migrationBuilder.DropColumn(
                name: "HasArsDeadline",
                table: "FactIntakeProcessings");
        }
    }
}
