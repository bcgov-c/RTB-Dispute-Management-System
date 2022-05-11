using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateDisputeHearing : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "HearingLocalStartDateTime",
                table: "DisputeHearings",
                newName: "NoticeHearingStartDateTime");

            migrationBuilder.AddColumn<byte>(
                name: "SharedHearingLinkType",
                table: "DisputeHearings",
                nullable: false,
                defaultValue: (byte)0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SharedHearingLinkType",
                table: "DisputeHearings");

            migrationBuilder.RenameColumn(
                name: "NoticeHearingStartDateTime",
                table: "DisputeHearings",
                newName: "HearingLocalStartDateTime");
        }
    }
}
