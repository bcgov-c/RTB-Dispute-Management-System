using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddRemedyStatusReasonCode : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "RemedyStatsReason",
                table: "Remedies",
                newName: "RemedyStatusReason");

            migrationBuilder.AddColumn<byte>(
                name: "RemedyStatusReasonCode",
                table: "Remedies",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RemedyStatusReasonCode",
                table: "Remedies");

            migrationBuilder.RenameColumn(
                name: "RemedyStatusReason",
                table: "Remedies",
                newName: "RemedyStatsReason");
        }
    }
}
