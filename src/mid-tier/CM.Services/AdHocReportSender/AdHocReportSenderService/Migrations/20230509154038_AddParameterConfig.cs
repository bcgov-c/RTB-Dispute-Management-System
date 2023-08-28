using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Migrations
{
    public partial class AddParameterConfig : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ParameterConfig",
                table: "AdHocDlReports",
                type: "json",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ParameterConfig",
                table: "AdHocDlReports");
        }
    }
}
