using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateOutcomeDocGroup1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DocNote",
                table: "OutcomeDocGroups",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "DocVersion",
                table: "OutcomeDocGroups",
                type: "smallint",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DocNote",
                table: "OutcomeDocGroups");

            migrationBuilder.DropColumn(
                name: "DocVersion",
                table: "OutcomeDocGroups");
        }
    }
}
