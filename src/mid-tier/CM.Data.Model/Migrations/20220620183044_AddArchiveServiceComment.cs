using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AddArchiveServiceComment : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ArchiveServiceComment",
                table: "NoticeServices",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ArchiveServiceComment",
                table: "FilePackageServices",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ArchiveServiceComment",
                table: "NoticeServices");

            migrationBuilder.DropColumn(
                name: "ArchiveServiceComment",
                table: "FilePackageServices");
        }
    }
}
