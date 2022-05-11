using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateTrialDisputes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TrialInterventions_Disputes_DisputeId",
                table: "TrialInterventions");

            migrationBuilder.DropForeignKey(
                name: "FK_TrialParticipants_Disputes_DisputeId",
                table: "TrialParticipants");

            migrationBuilder.DropIndex(
                name: "IX_TrialParticipants_DisputeId",
                table: "TrialParticipants");

            migrationBuilder.DropIndex(
                name: "IX_TrialInterventions_DisputeId",
                table: "TrialInterventions");

            migrationBuilder.DropColumn(
                name: "DisputeId",
                table: "TrialParticipants");

            migrationBuilder.DropColumn(
                name: "DisputeId",
                table: "TrialInterventions");

            migrationBuilder.RenameColumn(
                name: "DisputeGuid",
                table: "TrialParticipants",
                newName: "TrialDisputeGuid1");

            migrationBuilder.RenameColumn(
                name: "DisputeGuid",
                table: "TrialInterventions",
                newName: "TrialDisputeGuid1");

            migrationBuilder.AddColumn<Guid>(
                name: "TrialDisputeGuid",
                table: "TrialParticipants",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TrialDisputeGuid",
                table: "TrialInterventions",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TrialParticipants_TrialDisputeGuid1",
                table: "TrialParticipants",
                column: "TrialDisputeGuid1");

            migrationBuilder.CreateIndex(
                name: "IX_TrialInterventions_TrialDisputeGuid1",
                table: "TrialInterventions",
                column: "TrialDisputeGuid1");

            migrationBuilder.AddForeignKey(
                name: "FK_TrialInterventions_TrialDisputes_TrialDisputeGuid1",
                table: "TrialInterventions",
                column: "TrialDisputeGuid1",
                principalTable: "TrialDisputes",
                principalColumn: "TrialDisputeGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrialParticipants_TrialDisputes_TrialDisputeGuid1",
                table: "TrialParticipants",
                column: "TrialDisputeGuid1",
                principalTable: "TrialDisputes",
                principalColumn: "TrialDisputeGuid",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TrialInterventions_TrialDisputes_TrialDisputeGuid1",
                table: "TrialInterventions");

            migrationBuilder.DropForeignKey(
                name: "FK_TrialParticipants_TrialDisputes_TrialDisputeGuid1",
                table: "TrialParticipants");

            migrationBuilder.DropIndex(
                name: "IX_TrialParticipants_TrialDisputeGuid1",
                table: "TrialParticipants");

            migrationBuilder.DropIndex(
                name: "IX_TrialInterventions_TrialDisputeGuid1",
                table: "TrialInterventions");

            migrationBuilder.DropColumn(
                name: "TrialDisputeGuid",
                table: "TrialParticipants");

            migrationBuilder.DropColumn(
                name: "TrialDisputeGuid",
                table: "TrialInterventions");

            migrationBuilder.RenameColumn(
                name: "TrialDisputeGuid1",
                table: "TrialParticipants",
                newName: "DisputeGuid");

            migrationBuilder.RenameColumn(
                name: "TrialDisputeGuid1",
                table: "TrialInterventions",
                newName: "DisputeGuid");

            migrationBuilder.AddColumn<int>(
                name: "DisputeId",
                table: "TrialParticipants",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DisputeId",
                table: "TrialInterventions",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TrialParticipants_DisputeId",
                table: "TrialParticipants",
                column: "DisputeId");

            migrationBuilder.CreateIndex(
                name: "IX_TrialInterventions_DisputeId",
                table: "TrialInterventions",
                column: "DisputeId");

            migrationBuilder.AddForeignKey(
                name: "FK_TrialInterventions_Disputes_DisputeId",
                table: "TrialInterventions",
                column: "DisputeId",
                principalTable: "Disputes",
                principalColumn: "DisputeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrialParticipants_Disputes_DisputeId",
                table: "TrialParticipants",
                column: "DisputeId",
                principalTable: "Disputes",
                principalColumn: "DisputeId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
