using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class AddNewFields1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AwardedClarifications",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AwardedCorrections",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AwardedReviewConsiderations",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DisputeComplexity",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FirstDecisionDateTime",
                table: "FactDisputeSummaries",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FirstDecisionDateTimeId",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FirstParticipatoryHearingDateTime",
                table: "FactDisputeSummaries",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FirstParticipatoryHearingDateTimeId",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RequestedClarifications",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RequestedCorrections",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RequestedReviewConsideration",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AwardedClarifications",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "AwardedCorrections",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "AwardedReviewConsiderations",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "DisputeComplexity",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "FirstDecisionDateTime",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "FirstDecisionDateTimeId",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "FirstParticipatoryHearingDateTime",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "FirstParticipatoryHearingDateTimeId",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "RequestedClarifications",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "RequestedCorrections",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "RequestedReviewConsideration",
                table: "FactDisputeSummaries");
        }
    }
}
