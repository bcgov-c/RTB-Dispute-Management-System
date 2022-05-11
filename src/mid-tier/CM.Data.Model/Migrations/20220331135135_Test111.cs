using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class Test111 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DisputeHearings_Hearings_HearingId",
                table: "DisputeHearings");

            migrationBuilder.AddForeignKey(
                name: "FK_DisputeHearings_Hearings_HearingId",
                table: "DisputeHearings",
                column: "HearingId",
                principalTable: "Hearings",
                principalColumn: "HearingId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DisputeHearings_Hearings_HearingId",
                table: "DisputeHearings");

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
