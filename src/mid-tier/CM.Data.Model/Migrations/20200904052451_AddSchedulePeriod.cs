using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddSchedulePeriod : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SchedulePeriods",
                columns: table => new
                {
                    SchedulePeriodId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    PeriodTimeZone = table.Column<int>(nullable: false),
                    PeriodStart = table.Column<DateTime>(nullable: false),
                    PeriodEnd = table.Column<DateTime>(nullable: false),
                    LocalPeriodStart = table.Column<DateTime>(nullable: false),
                    LocalPeriodEnd = table.Column<DateTime>(nullable: false),
                    PeriodStatus = table.Column<int>(nullable: false, defaultValue: 100),
                    IsDeleted = table.Column<bool>(nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SchedulePeriods", x => x.SchedulePeriodId);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SchedulePeriods");
        }
    }
}
