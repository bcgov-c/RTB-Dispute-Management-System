using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateSubmitterRelationAndFK : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OutcomeDocRequests_SystemUsers_SubmitterId",
                table: "OutcomeDocRequests");

            migrationBuilder.AddForeignKey(
                name: "FK_OutcomeDocRequests_Participants_SubmitterId",
                table: "OutcomeDocRequests",
                column: "SubmitterId",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OutcomeDocRequests_Participants_SubmitterId",
                table: "OutcomeDocRequests");

            migrationBuilder.AddForeignKey(
                name: "FK_OutcomeDocRequests_SystemUsers_SubmitterId",
                table: "OutcomeDocRequests",
                column: "SubmitterId",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
