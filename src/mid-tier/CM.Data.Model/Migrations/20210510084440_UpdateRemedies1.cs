using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateRemedies1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte>(
                name: "PrevRemedyStatusReason",
                table: "Remedies",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "PrevRemedyStatusReasonCode",
                table: "Remedies",
                type: "smallint",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PrevRemedyStatusReason",
                table: "Remedies");

            migrationBuilder.DropColumn(
                name: "PrevRemedyStatusReasonCode",
                table: "Remedies");
        }
    }
}
