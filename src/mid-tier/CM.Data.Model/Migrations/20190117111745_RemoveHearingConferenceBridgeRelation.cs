using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class RemoveHearingConferenceBridgeRelation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Hearings_ConferenceBridges_ConferenceBridgeId",
                table: "Hearings");

            migrationBuilder.DropIndex(
                name: "IX_Hearings_ConferenceBridgeId",
                table: "Hearings");

            migrationBuilder.DropColumn(
                name: "ConferenceBridgeId",
                table: "Hearings");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ConferenceBridgeId",
                table: "Hearings",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Hearings_ConferenceBridgeId",
                table: "Hearings",
                column: "ConferenceBridgeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Hearings_ConferenceBridges_ConferenceBridgeId",
                table: "Hearings",
                column: "ConferenceBridgeId",
                principalTable: "ConferenceBridges",
                principalColumn: "ConferenceBridgeId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
