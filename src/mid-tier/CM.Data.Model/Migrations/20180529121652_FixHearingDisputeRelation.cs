using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class FixHearingDisputeRelation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Hearings_Disputes_DisputeId",
                table: "Hearings");

            migrationBuilder.DropIndex(
                name: "IX_Hearings_DisputeId",
                table: "Hearings");

            migrationBuilder.DropColumn(
                name: "DisputeId",
                table: "Hearings");

            migrationBuilder.CreateIndex(
                name: "IX_Hearings_DisputeGuid",
                table: "Hearings",
                column: "DisputeGuid");

            migrationBuilder.AddForeignKey(
                name: "FK_Hearings_Disputes_DisputeGuid",
                table: "Hearings",
                column: "DisputeGuid",
                principalTable: "Disputes",
                principalColumn: "DisputeGuid",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Hearings_Disputes_DisputeGuid",
                table: "Hearings");

            migrationBuilder.DropIndex(
                name: "IX_Hearings_DisputeGuid",
                table: "Hearings");

            migrationBuilder.AddColumn<int>(
                name: "DisputeId",
                table: "Hearings",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Hearings_DisputeId",
                table: "Hearings",
                column: "DisputeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Hearings_Disputes_DisputeId",
                table: "Hearings",
                column: "DisputeId",
                principalTable: "Disputes",
                principalColumn: "DisputeId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
