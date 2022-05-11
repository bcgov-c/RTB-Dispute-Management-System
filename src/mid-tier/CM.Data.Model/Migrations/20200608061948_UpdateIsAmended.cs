using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateIsAmended : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAmmended",
                table: "CustomDataObjects");

            migrationBuilder.AddColumn<bool>(
                name: "IsAmended",
                table: "CustomDataObjects",
                nullable: true,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAmended",
                table: "CustomDataObjects");

            migrationBuilder.AddColumn<bool>(
                name: "IsAmmended",
                table: "CustomDataObjects",
                type: "boolean",
                nullable: true,
                defaultValue: false);
        }
    }
}
