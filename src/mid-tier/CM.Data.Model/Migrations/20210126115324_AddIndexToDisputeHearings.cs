using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddIndexToDisputeHearings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_DisputeHearings_DisputeHearingStatus",
                table: "DisputeHearings",
                column: "DisputeHearingStatus");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DisputeHearings_DisputeHearingStatus",
                table: "DisputeHearings");
        }
    }
}
