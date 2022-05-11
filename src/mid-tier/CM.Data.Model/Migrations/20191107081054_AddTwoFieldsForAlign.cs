using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddTwoFieldsForAlign : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RentPaymentInterval",
                table: "PostedDecisions",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "TenancyEnded",
                table: "PostedDecisions",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RentPaymentInterval",
                table: "PostedDecisions");

            migrationBuilder.DropColumn(
                name: "TenancyEnded",
                table: "PostedDecisions");
        }
    }
}
