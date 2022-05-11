using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.PostedDecision.PostedDecisionDataService.Migrations
{
    public partial class UpdatePostedDecisions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AnonDecisionId",
                table: "PostedDecisions",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BusinessNames",
                table: "PostedDecisions",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "MateriallyDifferent",
                table: "PostedDecisions",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AnonDecisionId",
                table: "PostedDecisions");

            migrationBuilder.DropColumn(
                name: "BusinessNames",
                table: "PostedDecisions");

            migrationBuilder.DropColumn(
                name: "MateriallyDifferent",
                table: "PostedDecisions");
        }
    }
}
