using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddNewCmsArchiveFields1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Agent_For",
                table: "CMSParticipants",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "Additional_Rent_Increase",
                table: "CMSData",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Dispute_Province",
                table: "CMSData",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Service_Code",
                table: "CMSData",
                maxLength: 10,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Agent_For",
                table: "CMSParticipants");

            migrationBuilder.DropColumn(
                name: "Additional_Rent_Increase",
                table: "CMSData");

            migrationBuilder.DropColumn(
                name: "Dispute_Province",
                table: "CMSData");

            migrationBuilder.DropColumn(
                name: "Service_Code",
                table: "CMSData");
        }
    }
}
