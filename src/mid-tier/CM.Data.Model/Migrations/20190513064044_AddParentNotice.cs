using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddParentNotice : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ParentNoticeId",
                table: "Notices",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notices_ParentNoticeId",
                table: "Notices",
                column: "ParentNoticeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_Notices_ParentNoticeId",
                table: "Notices",
                column: "ParentNoticeId",
                principalTable: "Notices",
                principalColumn: "NoticeId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notices_Notices_ParentNoticeId",
                table: "Notices");

            migrationBuilder.DropIndex(
                name: "IX_Notices_ParentNoticeId",
                table: "Notices");

            migrationBuilder.DropColumn(
                name: "ParentNoticeId",
                table: "Notices");
        }
    }
}
