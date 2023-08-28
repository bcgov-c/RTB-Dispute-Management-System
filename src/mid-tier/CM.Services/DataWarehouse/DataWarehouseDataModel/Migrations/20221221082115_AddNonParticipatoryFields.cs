using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class AddNonParticipatoryFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "NonParticipatoryClosed",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NonParticipatoryWaitingDecision",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NonParticipatoryWaitingDecisionOldest",
                table: "FactTimeStatistics",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StatusAdjourned",
                table: "FactTimeStatistics",
                type: "integer",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NonParticipatoryClosed",
                table: "FactTimeStatistics");

            migrationBuilder.DropColumn(
                name: "NonParticipatoryWaitingDecision",
                table: "FactTimeStatistics");

            migrationBuilder.DropColumn(
                name: "NonParticipatoryWaitingDecisionOldest",
                table: "FactTimeStatistics");

            migrationBuilder.DropColumn(
                name: "StatusAdjourned",
                table: "FactTimeStatistics");
        }
    }
}
