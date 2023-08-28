using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AddConferenceType : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte>(
                name: "ConferenceType",
                table: "Hearings",
                type: "smallint",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ConferenceType",
                table: "Hearings");
        }
    }
}
