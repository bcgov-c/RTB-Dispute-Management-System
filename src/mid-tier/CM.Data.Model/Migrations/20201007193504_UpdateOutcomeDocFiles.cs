using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateOutcomeDocFiles : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "MateriallyDifferent",
                table: "OutcomeDocFiles",
                nullable: true,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NoteWorthy",
                table: "OutcomeDocFiles",
                nullable: true,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MateriallyDifferent",
                table: "OutcomeDocFiles");

            migrationBuilder.DropColumn(
                name: "NoteWorthy",
                table: "OutcomeDocFiles");
        }
    }
}
