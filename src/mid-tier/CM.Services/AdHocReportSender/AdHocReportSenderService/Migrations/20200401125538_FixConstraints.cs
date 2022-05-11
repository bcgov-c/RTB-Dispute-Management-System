using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Migrations
{
    public partial class FixConstraints : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AdHocReportsTracking_AdHocReportId",
                table: "AdHocReportsTracking");

            migrationBuilder.DropIndex(
                name: "IX_AdHocReportAttachments_AdHocReportId",
                table: "AdHocReportAttachments");

            migrationBuilder.CreateIndex(
                name: "IX_AdHocReportsTracking_AdHocReportId",
                table: "AdHocReportsTracking",
                column: "AdHocReportId");

            migrationBuilder.CreateIndex(
                name: "IX_AdHocReportAttachments_AdHocReportId",
                table: "AdHocReportAttachments",
                column: "AdHocReportId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AdHocReportsTracking_AdHocReportId",
                table: "AdHocReportsTracking");

            migrationBuilder.DropIndex(
                name: "IX_AdHocReportAttachments_AdHocReportId",
                table: "AdHocReportAttachments");

            migrationBuilder.CreateIndex(
                name: "IX_AdHocReportsTracking_AdHocReportId",
                table: "AdHocReportsTracking",
                column: "AdHocReportId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AdHocReportAttachments_AdHocReportId",
                table: "AdHocReportAttachments",
                column: "AdHocReportId",
                unique: true);
        }
    }
}
