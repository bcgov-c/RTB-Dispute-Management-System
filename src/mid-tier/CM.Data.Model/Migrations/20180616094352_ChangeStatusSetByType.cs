using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class ChangeStatusSetByType : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StatusSetBy",
                table: "DisputeStatuses");

            migrationBuilder.AddColumn<int>(
                name: "StatusSetBy",
                table: "DisputeStatuses",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StatusSetBy",
                table: "DisputeStatuses");

            migrationBuilder.AddColumn<string>(
                name: "StatusSetBy",
                table: "DisputeStatuses",
                maxLength: 100,
                nullable: true);
        }
    }
}
