using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateFilePackageServiceFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "FilePackageServices");

            migrationBuilder.AddColumn<byte>(
                name: "ValidationStatus",
                table: "FilePackageServices",
                type: "smallint",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ValidationStatus",
                table: "FilePackageServices");

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "FilePackageServices",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
