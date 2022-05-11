using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.PostedDecision.PostedDecisionDataService.Migrations
{
    public partial class AddFileUrl : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FilePath",
                table: "PostedDecisions",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FilePath",
                table: "PostedDecisions");
        }
    }
}
