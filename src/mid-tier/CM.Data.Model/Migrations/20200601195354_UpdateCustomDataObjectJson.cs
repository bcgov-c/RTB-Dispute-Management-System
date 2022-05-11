using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateCustomDataObjectJson : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ObjectJson",
                table: "CustomDataObjects",
                type: "json",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "jsonb",
                oldNullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ObjectJson",
                table: "CustomDataObjects",
                type: "jsonb",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "json",
                oldNullable: true);
        }
    }
}
