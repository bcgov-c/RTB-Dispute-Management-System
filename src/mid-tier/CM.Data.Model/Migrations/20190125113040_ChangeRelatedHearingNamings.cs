using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class ChangeRelatedHearingNamings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DisputeHearings_ScheduledHearings_ScheduledHearingId",
                table: "DisputeHearings");

            migrationBuilder.DropForeignKey(
                name: "FK_HearingParticipations_ScheduledHearings_ScheduledHearingId",
                table: "HearingParticipations");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_ScheduledHearings_ScheduledHearingId",
                table: "Notices");

            migrationBuilder.DropForeignKey(
                name: "FK_ScheduledHearings_ConferenceBridges_ConferenceBridgeId",
                table: "ScheduledHearings");

            migrationBuilder.DropForeignKey(
                name: "FK_ScheduledHearings_SystemUsers_HearingOwner",
                table: "ScheduledHearings");

            migrationBuilder.DropForeignKey(
                name: "FK_ScheduledHearings_SystemUsers_StaffParticipant1",
                table: "ScheduledHearings");

            migrationBuilder.DropForeignKey(
                name: "FK_ScheduledHearings_SystemUsers_StaffParticipant2",
                table: "ScheduledHearings");

            migrationBuilder.DropForeignKey(
                name: "FK_ScheduledHearings_SystemUsers_StaffParticipant3",
                table: "ScheduledHearings");

            migrationBuilder.DropForeignKey(
                name: "FK_ScheduledHearings_SystemUsers_StaffParticipant4",
                table: "ScheduledHearings");

            migrationBuilder.DropForeignKey(
                name: "FK_ScheduledHearings_SystemUsers_StaffParticipant5",
                table: "ScheduledHearings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ScheduledHearings",
                table: "ScheduledHearings");

            migrationBuilder.RenameTable(
                name: "ScheduledHearings",
                newName: "Hearings");

            migrationBuilder.RenameColumn(
                name: "ScheduledHearingId",
                table: "Notices",
                newName: "HearingId");

            migrationBuilder.RenameIndex(
                name: "IX_Notices_ScheduledHearingId",
                table: "Notices",
                newName: "IX_Notices_HearingId");

            migrationBuilder.RenameColumn(
                name: "ScheduledHearingId",
                table: "HearingParticipations",
                newName: "HearingId");

            migrationBuilder.RenameIndex(
                name: "IX_HearingParticipations_ScheduledHearingId",
                table: "HearingParticipations",
                newName: "IX_HearingParticipations_HearingId");

            migrationBuilder.RenameColumn(
                name: "ScheduledHearingId",
                table: "DisputeHearings",
                newName: "HearingId");

            migrationBuilder.RenameIndex(
                name: "IX_DisputeHearings_ScheduledHearingId",
                table: "DisputeHearings",
                newName: "IX_DisputeHearings_HearingId");

            migrationBuilder.RenameIndex(
                name: "IX_ScheduledHearings_StaffParticipant5",
                table: "Hearings",
                newName: "IX_Hearings_StaffParticipant5");

            migrationBuilder.RenameIndex(
                name: "IX_ScheduledHearings_StaffParticipant4",
                table: "Hearings",
                newName: "IX_Hearings_StaffParticipant4");

            migrationBuilder.RenameIndex(
                name: "IX_ScheduledHearings_StaffParticipant3",
                table: "Hearings",
                newName: "IX_Hearings_StaffParticipant3");

            migrationBuilder.RenameIndex(
                name: "IX_ScheduledHearings_StaffParticipant2",
                table: "Hearings",
                newName: "IX_Hearings_StaffParticipant2");

            migrationBuilder.RenameIndex(
                name: "IX_ScheduledHearings_StaffParticipant1",
                table: "Hearings",
                newName: "IX_Hearings_StaffParticipant1");

            migrationBuilder.RenameIndex(
                name: "IX_ScheduledHearings_HearingOwner",
                table: "Hearings",
                newName: "IX_Hearings_HearingOwner");

            migrationBuilder.RenameIndex(
                name: "IX_ScheduledHearings_ConferenceBridgeId",
                table: "Hearings",
                newName: "IX_Hearings_ConferenceBridgeId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Hearings",
                table: "Hearings",
                column: "HearingId");

            migrationBuilder.AddForeignKey(
                name: "FK_DisputeHearings_Hearings_HearingId",
                table: "DisputeHearings",
                column: "HearingId",
                principalTable: "Hearings",
                principalColumn: "HearingId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_HearingParticipations_Hearings_HearingId",
                table: "HearingParticipations",
                column: "HearingId",
                principalTable: "Hearings",
                principalColumn: "HearingId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Hearings_ConferenceBridges_ConferenceBridgeId",
                table: "Hearings",
                column: "ConferenceBridgeId",
                principalTable: "ConferenceBridges",
                principalColumn: "ConferenceBridgeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Hearings_SystemUsers_HearingOwner",
                table: "Hearings",
                column: "HearingOwner",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Hearings_SystemUsers_StaffParticipant1",
                table: "Hearings",
                column: "StaffParticipant1",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Hearings_SystemUsers_StaffParticipant2",
                table: "Hearings",
                column: "StaffParticipant2",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Hearings_SystemUsers_StaffParticipant3",
                table: "Hearings",
                column: "StaffParticipant3",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Hearings_SystemUsers_StaffParticipant4",
                table: "Hearings",
                column: "StaffParticipant4",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Hearings_SystemUsers_StaffParticipant5",
                table: "Hearings",
                column: "StaffParticipant5",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_Hearings_HearingId",
                table: "Notices",
                column: "HearingId",
                principalTable: "Hearings",
                principalColumn: "HearingId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DisputeHearings_Hearings_HearingId",
                table: "DisputeHearings");

            migrationBuilder.DropForeignKey(
                name: "FK_HearingParticipations_Hearings_HearingId",
                table: "HearingParticipations");

            migrationBuilder.DropForeignKey(
                name: "FK_Hearings_ConferenceBridges_ConferenceBridgeId",
                table: "Hearings");

            migrationBuilder.DropForeignKey(
                name: "FK_Hearings_SystemUsers_HearingOwner",
                table: "Hearings");

            migrationBuilder.DropForeignKey(
                name: "FK_Hearings_SystemUsers_StaffParticipant1",
                table: "Hearings");

            migrationBuilder.DropForeignKey(
                name: "FK_Hearings_SystemUsers_StaffParticipant2",
                table: "Hearings");

            migrationBuilder.DropForeignKey(
                name: "FK_Hearings_SystemUsers_StaffParticipant3",
                table: "Hearings");

            migrationBuilder.DropForeignKey(
                name: "FK_Hearings_SystemUsers_StaffParticipant4",
                table: "Hearings");

            migrationBuilder.DropForeignKey(
                name: "FK_Hearings_SystemUsers_StaffParticipant5",
                table: "Hearings");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_Hearings_HearingId",
                table: "Notices");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Hearings",
                table: "Hearings");

            migrationBuilder.RenameTable(
                name: "Hearings",
                newName: "ScheduledHearings");

            migrationBuilder.RenameColumn(
                name: "HearingId",
                table: "Notices",
                newName: "ScheduledHearingId");

            migrationBuilder.RenameIndex(
                name: "IX_Notices_HearingId",
                table: "Notices",
                newName: "IX_Notices_ScheduledHearingId");

            migrationBuilder.RenameColumn(
                name: "HearingId",
                table: "HearingParticipations",
                newName: "ScheduledHearingId");

            migrationBuilder.RenameIndex(
                name: "IX_HearingParticipations_HearingId",
                table: "HearingParticipations",
                newName: "IX_HearingParticipations_ScheduledHearingId");

            migrationBuilder.RenameColumn(
                name: "HearingId",
                table: "DisputeHearings",
                newName: "ScheduledHearingId");

            migrationBuilder.RenameIndex(
                name: "IX_DisputeHearings_HearingId",
                table: "DisputeHearings",
                newName: "IX_DisputeHearings_ScheduledHearingId");

            migrationBuilder.RenameIndex(
                name: "IX_Hearings_StaffParticipant5",
                table: "ScheduledHearings",
                newName: "IX_ScheduledHearings_StaffParticipant5");

            migrationBuilder.RenameIndex(
                name: "IX_Hearings_StaffParticipant4",
                table: "ScheduledHearings",
                newName: "IX_ScheduledHearings_StaffParticipant4");

            migrationBuilder.RenameIndex(
                name: "IX_Hearings_StaffParticipant3",
                table: "ScheduledHearings",
                newName: "IX_ScheduledHearings_StaffParticipant3");

            migrationBuilder.RenameIndex(
                name: "IX_Hearings_StaffParticipant2",
                table: "ScheduledHearings",
                newName: "IX_ScheduledHearings_StaffParticipant2");

            migrationBuilder.RenameIndex(
                name: "IX_Hearings_StaffParticipant1",
                table: "ScheduledHearings",
                newName: "IX_ScheduledHearings_StaffParticipant1");

            migrationBuilder.RenameIndex(
                name: "IX_Hearings_HearingOwner",
                table: "ScheduledHearings",
                newName: "IX_ScheduledHearings_HearingOwner");

            migrationBuilder.RenameIndex(
                name: "IX_Hearings_ConferenceBridgeId",
                table: "ScheduledHearings",
                newName: "IX_ScheduledHearings_ConferenceBridgeId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ScheduledHearings",
                table: "ScheduledHearings",
                column: "HearingId");

            migrationBuilder.AddForeignKey(
                name: "FK_DisputeHearings_ScheduledHearings_ScheduledHearingId",
                table: "DisputeHearings",
                column: "ScheduledHearingId",
                principalTable: "ScheduledHearings",
                principalColumn: "HearingId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_HearingParticipations_ScheduledHearings_ScheduledHearingId",
                table: "HearingParticipations",
                column: "ScheduledHearingId",
                principalTable: "ScheduledHearings",
                principalColumn: "HearingId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_ScheduledHearings_ScheduledHearingId",
                table: "Notices",
                column: "ScheduledHearingId",
                principalTable: "ScheduledHearings",
                principalColumn: "HearingId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduledHearings_ConferenceBridges_ConferenceBridgeId",
                table: "ScheduledHearings",
                column: "ConferenceBridgeId",
                principalTable: "ConferenceBridges",
                principalColumn: "ConferenceBridgeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduledHearings_SystemUsers_HearingOwner",
                table: "ScheduledHearings",
                column: "HearingOwner",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduledHearings_SystemUsers_StaffParticipant1",
                table: "ScheduledHearings",
                column: "StaffParticipant1",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduledHearings_SystemUsers_StaffParticipant2",
                table: "ScheduledHearings",
                column: "StaffParticipant2",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduledHearings_SystemUsers_StaffParticipant3",
                table: "ScheduledHearings",
                column: "StaffParticipant3",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduledHearings_SystemUsers_StaffParticipant4",
                table: "ScheduledHearings",
                column: "StaffParticipant4",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduledHearings_SystemUsers_StaffParticipant5",
                table: "ScheduledHearings",
                column: "StaffParticipant5",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
