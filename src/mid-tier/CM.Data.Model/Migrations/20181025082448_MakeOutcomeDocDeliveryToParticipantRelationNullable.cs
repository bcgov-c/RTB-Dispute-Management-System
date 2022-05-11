using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class MakeOutcomeDocDeliveryToParticipantRelationNullable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OutcomeDocDeliveries_Participants_ParticipantId",
                table: "OutcomeDocDeliveries");

            migrationBuilder.AlterColumn<int>(
                name: "ParticipantId",
                table: "OutcomeDocDeliveries",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddForeignKey(
                name: "FK_OutcomeDocDeliveries_Participants_ParticipantId",
                table: "OutcomeDocDeliveries",
                column: "ParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OutcomeDocDeliveries_Participants_ParticipantId",
                table: "OutcomeDocDeliveries");

            migrationBuilder.AlterColumn<int>(
                name: "ParticipantId",
                table: "OutcomeDocDeliveries",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_OutcomeDocDeliveries_Participants_ParticipantId",
                table: "OutcomeDocDeliveries",
                column: "ParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
