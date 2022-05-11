using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddScheduledAndDisputeHearingsRelation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ScheduledHearingId",
                table: "DisputeHearings",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_DisputeHearings_ScheduledHearingId",
                table: "DisputeHearings",
                column: "ScheduledHearingId");

            migrationBuilder.AddForeignKey(
                name: "FK_DisputeHearings_ScheduledHearings_ScheduledHearingId",
                table: "DisputeHearings",
                column: "ScheduledHearingId",
                principalTable: "ScheduledHearings",
                principalColumn: "ScheduledHearingId",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DisputeHearings_ScheduledHearings_ScheduledHearingId",
                table: "DisputeHearings");

            migrationBuilder.DropIndex(
                name: "IX_DisputeHearings_ScheduledHearingId",
                table: "DisputeHearings");

            migrationBuilder.DropColumn(
                name: "ScheduledHearingId",
                table: "DisputeHearings");
        }
    }
}
