using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class RemoveOldHearingAndNoticeRelation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ScheduledHearingId",
                table: "Notices",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notices_ScheduledHearingId",
                table: "Notices",
                column: "ScheduledHearingId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_ScheduledHearings_ScheduledHearingId",
                table: "Notices",
                column: "ScheduledHearingId",
                principalTable: "ScheduledHearings",
                principalColumn: "ScheduledHearingId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notices_ScheduledHearings_ScheduledHearingId",
                table: "Notices");

            migrationBuilder.DropIndex(
                name: "IX_Notices_ScheduledHearingId",
                table: "Notices");

            migrationBuilder.DropColumn(
                name: "ScheduledHearingId",
                table: "Notices");
        }
    }
}
