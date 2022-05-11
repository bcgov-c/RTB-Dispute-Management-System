using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddHearingParticipationScheduledHearingRelation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ScheduledHearingId",
                table: "HearingParticipations",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_HearingParticipations_ScheduledHearingId",
                table: "HearingParticipations",
                column: "ScheduledHearingId");

            migrationBuilder.AddForeignKey(
                name: "FK_HearingParticipations_ScheduledHearings_ScheduledHearingId",
                table: "HearingParticipations",
                column: "ScheduledHearingId",
                principalTable: "ScheduledHearings",
                principalColumn: "ScheduledHearingId",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_HearingParticipations_ScheduledHearings_ScheduledHearingId",
                table: "HearingParticipations");

            migrationBuilder.DropIndex(
                name: "IX_HearingParticipations_ScheduledHearingId",
                table: "HearingParticipations");

            migrationBuilder.DropColumn(
                name: "ScheduledHearingId",
                table: "HearingParticipations");
        }
    }
}
