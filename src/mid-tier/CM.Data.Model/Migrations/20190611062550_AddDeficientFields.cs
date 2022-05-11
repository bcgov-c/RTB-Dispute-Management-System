using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddDeficientFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDeficient",
                table: "Files",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeficient",
                table: "FileDescriptions",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "IsDeficientReason",
                table: "FileDescriptions",
                maxLength: 255,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDeficient",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "IsDeficient",
                table: "FileDescriptions");

            migrationBuilder.DropColumn(
                name: "IsDeficientReason",
                table: "FileDescriptions");
        }
    }
}
