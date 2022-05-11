using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Migrations
{
    public partial class AddUserGroup : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte>(
                name: "ReportUserGroup",
                table: "AdHocDlReports",
                type: "smallint",
                nullable: false,
                defaultValue: (byte)0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReportUserGroup",
                table: "AdHocDlReports");
        }
    }
}
