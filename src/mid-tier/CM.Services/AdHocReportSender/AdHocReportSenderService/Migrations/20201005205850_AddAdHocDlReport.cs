using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Migrations
{
    public partial class AddAdHocDlReport : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AdHocDlReports",
                columns: table => new
                {
                    AdHocDlReportId = table.Column<long>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(nullable: true),
                    Description = table.Column<string>(nullable: true),
                    HtmlDataDictionary = table.Column<string>(nullable: true),
                    Type = table.Column<byte>(nullable: false),
                    SubType = table.Column<byte>(nullable: false),
                    QueryForName = table.Column<string>(nullable: true),
                    QueryForReport = table.Column<string>(nullable: true),
                    IsActive = table.Column<bool>(nullable: false),
                    CreatedDate = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdHocDlReports", x => x.AdHocDlReportId);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdHocDlReports");
        }
    }
}
