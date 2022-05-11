using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class RemoveHearingDisputeHearingRelation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DisputeHearings_Hearings_HearingId",
                table: "DisputeHearings");

            migrationBuilder.DropIndex(
                name: "IX_DisputeHearings_HearingId",
                table: "DisputeHearings");

            migrationBuilder.DropColumn(
                name: "HearingId",
                table: "DisputeHearings");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "HearingId",
                table: "DisputeHearings",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_DisputeHearings_HearingId",
                table: "DisputeHearings",
                column: "HearingId");

            migrationBuilder.AddForeignKey(
                name: "FK_DisputeHearings_Hearings_HearingId",
                table: "DisputeHearings",
                column: "HearingId",
                principalTable: "Hearings",
                principalColumn: "HearingId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
