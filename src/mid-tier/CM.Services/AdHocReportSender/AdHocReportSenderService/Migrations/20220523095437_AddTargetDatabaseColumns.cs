using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Migrations
{
    public partial class AddTargetDatabaseColumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte>(
                name: "TargetDatabase",
                table: "AdHocReportAttachments",
                type: "smallint",
                nullable: false,
                defaultValue: (byte)1);

            migrationBuilder.AddColumn<byte>(
                name: "TargetDatabase",
                table: "AdHocDlReports",
                type: "smallint",
                nullable: false,
                defaultValue: (byte)1);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TargetDatabase",
                table: "AdHocReportAttachments");

            migrationBuilder.DropColumn(
                name: "TargetDatabase",
                table: "AdHocDlReports");
        }
    }
}
