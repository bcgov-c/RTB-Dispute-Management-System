using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddSiteVersion : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SiteVersion",
                columns: table => new
                {
                    SiteVersionId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    TokenMethod = table.Column<byte>(nullable: false),
                    ReleaseNumber = table.Column<string>(maxLength: 10, nullable: true),
                    ReleaseDate = table.Column<DateTime>(nullable: true),
                    ReleaseDetails = table.Column<string>(maxLength: 2500, nullable: true),
                    UIVersion = table.Column<string>(maxLength: 10, nullable: true),
                    UIVersionDate = table.Column<DateTime>(nullable: true),
                    MidTierVersion = table.Column<string>(maxLength: 10, nullable: true),
                    MidTierVersionDate = table.Column<DateTime>(nullable: true),
                    PDFVersion = table.Column<string>(maxLength: 10, nullable: true),
                    PDFVersionDate = table.Column<DateTime>(nullable: true),
                    EmailGeneratorVersion = table.Column<string>(maxLength: 10, nullable: true),
                    EmailGeneratorVersionDate = table.Column<DateTime>(nullable: true),
                    EmailNotificationVersion = table.Column<string>(maxLength: 10, nullable: true),
                    EmailNotificationVersionDate = table.Column<DateTime>(nullable: true),
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SiteVersion", x => x.SiteVersionId);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SiteVersion");
        }
    }
}
