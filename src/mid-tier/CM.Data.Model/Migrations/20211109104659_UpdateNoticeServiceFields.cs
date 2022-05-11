using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateNoticeServiceFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "NoticeServices");

            migrationBuilder.AddColumn<byte>(
                name: "ValidationStatus",
                table: "NoticeServices",
                type: "smallint",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ValidationStatus",
                table: "NoticeServices");

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "NoticeServices",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
