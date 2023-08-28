using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AdHocFileCleanup : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AdHocFileCleanup",
                columns: table => new
                {
                    AdHocFileCleanupId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    Title = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Type = table.Column<byte>(type: "smallint", nullable: true),
                    CronJob = table.Column<string>(type: "text", nullable: true),
                    QueryForCleanup = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    ModifiedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdHocFileCleanup", x => x.AdHocFileCleanupId);
                });

            migrationBuilder.CreateTable(
                name: "AdHocFileCleanupTracking",
                columns: table => new
                {
                    AdHocFileCleanupTrackingId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    AdHocFileCleanupId = table.Column<long>(type: "bigint", nullable: false),
                    StartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<byte>(type: "smallint", nullable: false),
                    Count = table.Column<int>(type: "integer", nullable: false),
                    Size = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdHocFileCleanupTracking", x => x.AdHocFileCleanupTrackingId);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdHocFileCleanup");

            migrationBuilder.DropTable(
                name: "AdHocFileCleanupTracking");
        }
    }
}
