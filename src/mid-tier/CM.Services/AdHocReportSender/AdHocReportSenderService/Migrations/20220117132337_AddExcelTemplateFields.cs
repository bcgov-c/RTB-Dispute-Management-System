using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Migrations
{
    public partial class AddExcelTemplateFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ExcelTemplateExists",
                table: "AdHocDlReports",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ExcelTemplateId",
                table: "AdHocDlReports",
                type: "integer",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExcelTemplateExists",
                table: "AdHocDlReports");

            migrationBuilder.DropColumn(
                name: "ExcelTemplateId",
                table: "AdHocDlReports");
        }
    }
}
