using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class DeleteRequestOwnerFK : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ScheduleRequests_SystemUsers_RequestOwnerId",
                table: "ScheduleRequests");

            migrationBuilder.DropIndex(
                name: "IX_ScheduleRequests_RequestOwnerId",
                table: "ScheduleRequests");

            migrationBuilder.AddColumn<int>(
                name: "SystemUserId",
                table: "ScheduleRequests",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleRequests_SystemUserId",
                table: "ScheduleRequests",
                column: "SystemUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduleRequests_SystemUsers_SystemUserId",
                table: "ScheduleRequests",
                column: "SystemUserId",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ScheduleRequests_SystemUsers_SystemUserId",
                table: "ScheduleRequests");

            migrationBuilder.DropIndex(
                name: "IX_ScheduleRequests_SystemUserId",
                table: "ScheduleRequests");

            migrationBuilder.DropColumn(
                name: "SystemUserId",
                table: "ScheduleRequests");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleRequests_RequestOwnerId",
                table: "ScheduleRequests",
                column: "RequestOwnerId");

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduleRequests_SystemUsers_RequestOwnerId",
                table: "ScheduleRequests",
                column: "RequestOwnerId",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
