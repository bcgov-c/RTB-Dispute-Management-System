using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateSubstitutedService : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RequestAdditionalInfo",
                table: "SubstitutedServices",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "RequestSource",
                table: "SubstitutedServices",
                type: "smallint",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RequestAdditionalInfo",
                table: "SubstitutedServices");

            migrationBuilder.DropColumn(
                name: "RequestSource",
                table: "SubstitutedServices");
        }
    }
}
