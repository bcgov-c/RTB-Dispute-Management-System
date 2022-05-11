using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.PostedDecision.PostedDecisionDataService.Migrations
{
    public partial class UpdateOutcomeDocument : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte>(
                name: "ClaimCode",
                table: "PostedDecisionOutcomes",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ClaimCode",
                table: "PostedDecisionOutcomes");
        }
    }
}
