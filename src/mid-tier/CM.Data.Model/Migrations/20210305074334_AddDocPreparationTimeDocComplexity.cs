using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddDocPreparationTimeDocComplexity : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte>(
                name: "DocComplexity",
                table: "OutcomeDocGroups",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DocPreparationTime",
                table: "OutcomeDocGroups",
                type: "integer",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DocComplexity",
                table: "OutcomeDocGroups");

            migrationBuilder.DropColumn(
                name: "DocPreparationTime",
                table: "OutcomeDocGroups");
        }
    }
}
