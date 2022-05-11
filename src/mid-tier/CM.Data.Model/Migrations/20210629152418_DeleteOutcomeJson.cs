using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class DeleteOutcomeJson : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OutcomeJson",
                table: "TrialOutcomes");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OutcomeJson",
                table: "TrialOutcomes",
                type: "text",
                nullable: true);
        }
    }
}
