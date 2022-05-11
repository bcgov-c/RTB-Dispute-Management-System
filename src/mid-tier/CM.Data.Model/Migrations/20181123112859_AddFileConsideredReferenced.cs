using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddFileConsideredReferenced : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "FileConsidered",
                table: "Files",
                nullable: true,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "FileReferenced",
                table: "Files",
                nullable: true,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FileConsidered",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "FileReferenced",
                table: "Files");
        }
    }
}
