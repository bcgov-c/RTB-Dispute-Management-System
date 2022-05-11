using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateAuditLogsFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SubmittedBy",
                table: "AuditLogs",
                newName: "SubmitterRole");

            migrationBuilder.AddColumn<string>(
                name: "SubmitterName",
                table: "AuditLogs",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SubmitterParticipantId",
                table: "AuditLogs",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SubmitterUserId",
                table: "AuditLogs",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_SubmitterParticipantId",
                table: "AuditLogs",
                column: "SubmitterParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_SubmitterUserId",
                table: "AuditLogs",
                column: "SubmitterUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_AuditLogs_Participants_SubmitterParticipantId",
                table: "AuditLogs",
                column: "SubmitterParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AuditLogs_SystemUsers_SubmitterUserId",
                table: "AuditLogs",
                column: "SubmitterUserId",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AuditLogs_Participants_SubmitterParticipantId",
                table: "AuditLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_AuditLogs_SystemUsers_SubmitterUserId",
                table: "AuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_SubmitterParticipantId",
                table: "AuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_SubmitterUserId",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "SubmitterName",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "SubmitterParticipantId",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "SubmitterUserId",
                table: "AuditLogs");

            migrationBuilder.RenameColumn(
                name: "SubmitterRole",
                table: "AuditLogs",
                newName: "SubmittedBy");
        }
    }
}
