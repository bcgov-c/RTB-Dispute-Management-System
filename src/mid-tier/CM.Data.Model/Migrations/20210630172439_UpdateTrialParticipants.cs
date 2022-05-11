using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateTrialParticipants : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TrialParticipants_TrialDisputes_TrialDisputeGuid1",
                table: "TrialParticipants");

            migrationBuilder.DropIndex(
                name: "IX_TrialParticipants_TrialDisputeGuid1",
                table: "TrialParticipants");

            migrationBuilder.DropColumn(
                name: "TrialDisputeGuid",
                table: "TrialParticipants");

            migrationBuilder.RenameColumn(
                name: "TrialDisputeGuid1",
                table: "TrialParticipants",
                newName: "DisputeGuid");

            migrationBuilder.AddColumn<int>(
                name: "DisputeId",
                table: "TrialParticipants",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TrialParticipants_DisputeId",
                table: "TrialParticipants",
                column: "DisputeId");

            migrationBuilder.AddForeignKey(
                name: "FK_TrialParticipants_Disputes_DisputeId",
                table: "TrialParticipants",
                column: "DisputeId",
                principalTable: "Disputes",
                principalColumn: "DisputeId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TrialParticipants_Disputes_DisputeId",
                table: "TrialParticipants");

            migrationBuilder.DropIndex(
                name: "IX_TrialParticipants_DisputeId",
                table: "TrialParticipants");

            migrationBuilder.DropColumn(
                name: "DisputeId",
                table: "TrialParticipants");

            migrationBuilder.RenameColumn(
                name: "DisputeGuid",
                table: "TrialParticipants",
                newName: "TrialDisputeGuid1");

            migrationBuilder.AddColumn<Guid>(
                name: "TrialDisputeGuid",
                table: "TrialParticipants",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TrialParticipants_TrialDisputeGuid1",
                table: "TrialParticipants",
                column: "TrialDisputeGuid1");

            migrationBuilder.AddForeignKey(
                name: "FK_TrialParticipants_TrialDisputes_TrialDisputeGuid1",
                table: "TrialParticipants",
                column: "TrialDisputeGuid1",
                principalTable: "TrialDisputes",
                principalColumn: "TrialDisputeGuid",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
