using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddDashboardAccess : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "DashboardAccess",
                table: "SystemUsers",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DashboardAccess",
                table: "SystemUsers");
        }
    }
}
