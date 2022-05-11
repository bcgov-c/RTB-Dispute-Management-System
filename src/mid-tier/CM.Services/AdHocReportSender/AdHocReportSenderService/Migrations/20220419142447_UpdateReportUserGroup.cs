using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Migrations
{
    public partial class UpdateReportUserGroup : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte>(
                name: "ReportUserGroup",
                table: "AdHocDlReports",
                type: "smallint",
                nullable: true,
                oldClrType: typeof(byte),
                oldType: "smallint");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte>(
                name: "ReportUserGroup",
                table: "AdHocDlReports",
                type: "smallint",
                nullable: false,
                defaultValue: (byte)0,
                oldClrType: typeof(byte),
                oldType: "smallint",
                oldNullable: true);
        }
    }
}
