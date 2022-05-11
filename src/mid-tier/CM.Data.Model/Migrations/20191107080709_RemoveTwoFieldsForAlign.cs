using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class RemoveTwoFieldsForAlign : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RentPaymentInterval",
                table: "PostedDecisions");

            migrationBuilder.DropColumn(
                name: "TenancyEnded",
                table: "PostedDecisions");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte>(
                name: "RentPaymentInterval",
                table: "PostedDecisions",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "TenancyEnded",
                table: "PostedDecisions",
                nullable: true);
        }
    }
}
