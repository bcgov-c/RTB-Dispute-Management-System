using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddFieldsToNoticeService : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte>(
                name: "OtherParticipantRole",
                table: "NoticeServices",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OtherParticpantTitle",
                table: "NoticeServices",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "ServiceDateUsed",
                table: "NoticeServices",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OtherParticipantRole",
                table: "NoticeServices");

            migrationBuilder.DropColumn(
                name: "OtherParticpantTitle",
                table: "NoticeServices");

            migrationBuilder.DropColumn(
                name: "ServiceDateUsed",
                table: "NoticeServices");
        }
    }
}
