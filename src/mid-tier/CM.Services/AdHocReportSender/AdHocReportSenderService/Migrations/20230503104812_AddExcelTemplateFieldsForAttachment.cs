using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Migrations
{
    public partial class AddExcelTemplateFieldsForAttachment : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ExcelTemplateExists",
                table: "AdHocReportAttachments",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ExcelTemplateId",
                table: "AdHocReportAttachments",
                type: "integer",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExcelTemplateExists",
                table: "AdHocReportAttachments");

            migrationBuilder.DropColumn(
                name: "ExcelTemplateId",
                table: "AdHocReportAttachments");
        }
    }
}
