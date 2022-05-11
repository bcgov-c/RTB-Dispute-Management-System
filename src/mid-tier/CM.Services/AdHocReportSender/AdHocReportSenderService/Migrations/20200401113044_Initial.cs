using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Migrations
{
    public partial class Initial : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AdHocReports",
                columns: table => new
                {
                    AdHocReportId = table.Column<long>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Description = table.Column<string>(nullable: true),
                    IsActive = table.Column<bool>(nullable: false),
                    EmailSubject = table.Column<string>(nullable: true),
                    EmailBody = table.Column<string>(nullable: true),
                    EmailFrom = table.Column<string>(nullable: true),
                    EmailTo = table.Column<string>(nullable: true),
                    CronJob = table.Column<string>(nullable: true),
                    CreatedDate = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdHocReports", x => x.AdHocReportId);
                });

            migrationBuilder.CreateTable(
                name: "AdHocReportAttachments",
                columns: table => new
                {
                    AdHocReportAttachmentId = table.Column<long>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AdHocReportId = table.Column<long>(nullable: false),
                    Description = table.Column<string>(nullable: true),
                    QueryForName = table.Column<string>(nullable: true),
                    QueryForAttachment = table.Column<string>(nullable: true),
                    IsActive = table.Column<bool>(nullable: false),
                    CreatedDate = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdHocReportAttachments", x => x.AdHocReportAttachmentId);
                    table.ForeignKey(
                        name: "FK_AdHocReportAttachments_AdHocReports_AdHocReportId",
                        column: x => x.AdHocReportId,
                        principalTable: "AdHocReports",
                        principalColumn: "AdHocReportId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AdHocReportsTracking",
                columns: table => new
                {
                    AdHocReportTrackingId = table.Column<long>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AdHocReportId = table.Column<long>(nullable: false),
                    SentDate = table.Column<DateTime>(nullable: true),
                    Status = table.Column<byte>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdHocReportsTracking", x => x.AdHocReportTrackingId);
                    table.ForeignKey(
                        name: "FK_AdHocReportsTracking_AdHocReports_AdHocReportId",
                        column: x => x.AdHocReportId,
                        principalTable: "AdHocReports",
                        principalColumn: "AdHocReportId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdHocReportAttachments_AdHocReportId",
                table: "AdHocReportAttachments",
                column: "AdHocReportId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AdHocReportsTracking_AdHocReportId",
                table: "AdHocReportsTracking",
                column: "AdHocReportId",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdHocReportAttachments");

            migrationBuilder.DropTable(
                name: "AdHocReportsTracking");

            migrationBuilder.DropTable(
                name: "AdHocReports");
        }
    }
}
