using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddTenancyUnits : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TenancyUnitType",
                table: "Disputes",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TenancyUnits",
                table: "Disputes",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TenancyUnitType",
                table: "Disputes");

            migrationBuilder.DropColumn(
                name: "TenancyUnits",
                table: "Disputes");
        }
    }
}
