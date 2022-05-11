using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddNoticeDeliveredToOther : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NoticeDeliveredToOther",
                table: "Notices",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NoticeDeliveredToOther",
                table: "Notices");
        }
    }
}
