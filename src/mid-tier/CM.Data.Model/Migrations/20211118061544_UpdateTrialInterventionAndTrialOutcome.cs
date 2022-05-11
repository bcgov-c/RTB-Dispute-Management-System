using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateTrialInterventionAndTrialOutcome : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TrialInterventions_TrialDisputes_TrialDisputeGuid1",
                table: "TrialInterventions");

            migrationBuilder.DropForeignKey(
                name: "FK_TrialInterventions_TrialParticipants_TrialParticipantGuid1",
                table: "TrialInterventions");

            migrationBuilder.DropForeignKey(
                name: "FK_TrialOutcomes_TrialDisputes_TrialDisputeGuid1",
                table: "TrialOutcomes");

            migrationBuilder.DropForeignKey(
                name: "FK_TrialOutcomes_TrialInterventions_TrialInterventionGuid1",
                table: "TrialOutcomes");

            migrationBuilder.DropForeignKey(
                name: "FK_TrialOutcomes_TrialParticipants_TrialParticipantGuid1",
                table: "TrialOutcomes");

            migrationBuilder.DropIndex(
                name: "IX_TrialOutcomes_TrialDisputeGuid1",
                table: "TrialOutcomes");

            migrationBuilder.DropIndex(
                name: "IX_TrialOutcomes_TrialInterventionGuid1",
                table: "TrialOutcomes");

            migrationBuilder.DropIndex(
                name: "IX_TrialOutcomes_TrialParticipantGuid1",
                table: "TrialOutcomes");

            migrationBuilder.DropIndex(
                name: "IX_TrialInterventions_TrialDisputeGuid1",
                table: "TrialInterventions");

            migrationBuilder.DropIndex(
                name: "IX_TrialInterventions_TrialParticipantGuid1",
                table: "TrialInterventions");

            migrationBuilder.DropColumn(
                name: "TrialDisputeGuid1",
                table: "TrialOutcomes");

            migrationBuilder.DropColumn(
                name: "TrialInterventionGuid1",
                table: "TrialOutcomes");

            migrationBuilder.DropColumn(
                name: "TrialParticipantGuid1",
                table: "TrialOutcomes");

            migrationBuilder.DropColumn(
                name: "TrialDisputeGuid1",
                table: "TrialInterventions");

            migrationBuilder.DropColumn(
                name: "TrialParticipantGuid1",
                table: "TrialInterventions");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "TrialDisputeGuid1",
                table: "TrialOutcomes",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TrialInterventionGuid1",
                table: "TrialOutcomes",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TrialParticipantGuid1",
                table: "TrialOutcomes",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TrialDisputeGuid1",
                table: "TrialInterventions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TrialParticipantGuid1",
                table: "TrialInterventions",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TrialOutcomes_TrialDisputeGuid1",
                table: "TrialOutcomes",
                column: "TrialDisputeGuid1");

            migrationBuilder.CreateIndex(
                name: "IX_TrialOutcomes_TrialInterventionGuid1",
                table: "TrialOutcomes",
                column: "TrialInterventionGuid1");

            migrationBuilder.CreateIndex(
                name: "IX_TrialOutcomes_TrialParticipantGuid1",
                table: "TrialOutcomes",
                column: "TrialParticipantGuid1");

            migrationBuilder.CreateIndex(
                name: "IX_TrialInterventions_TrialDisputeGuid1",
                table: "TrialInterventions",
                column: "TrialDisputeGuid1");

            migrationBuilder.CreateIndex(
                name: "IX_TrialInterventions_TrialParticipantGuid1",
                table: "TrialInterventions",
                column: "TrialParticipantGuid1");

            migrationBuilder.AddForeignKey(
                name: "FK_TrialInterventions_TrialDisputes_TrialDisputeGuid1",
                table: "TrialInterventions",
                column: "TrialDisputeGuid1",
                principalTable: "TrialDisputes",
                principalColumn: "TrialDisputeGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrialInterventions_TrialParticipants_TrialParticipantGuid1",
                table: "TrialInterventions",
                column: "TrialParticipantGuid1",
                principalTable: "TrialParticipants",
                principalColumn: "TrialParticipantGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrialOutcomes_TrialDisputes_TrialDisputeGuid1",
                table: "TrialOutcomes",
                column: "TrialDisputeGuid1",
                principalTable: "TrialDisputes",
                principalColumn: "TrialDisputeGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrialOutcomes_TrialInterventions_TrialInterventionGuid1",
                table: "TrialOutcomes",
                column: "TrialInterventionGuid1",
                principalTable: "TrialInterventions",
                principalColumn: "TrialInterventionGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrialOutcomes_TrialParticipants_TrialParticipantGuid1",
                table: "TrialOutcomes",
                column: "TrialParticipantGuid1",
                principalTable: "TrialParticipants",
                principalColumn: "TrialParticipantGuid",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
