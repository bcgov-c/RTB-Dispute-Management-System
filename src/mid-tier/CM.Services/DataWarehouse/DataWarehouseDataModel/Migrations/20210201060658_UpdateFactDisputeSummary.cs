using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class UpdateFactDisputeSummary : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AwardedMonetaryOrders",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "FactDisputeSummaries",
                type: "timestamp without time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "DecisionsInterim",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "DocumentSets",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "EvidenceFilesFromApplicant",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "EvidenceFilesMBFromApplicant",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "EvidenceFilesMBFromRespondent",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "EvidencePackagesFromApplicant",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "EvidencePackagesFromRespondent",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "EvidencefilesFromRespondent",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "IsAdjourned",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "OrdersMonetary",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "OrdersPossession",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RequestedAmount",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "TenancyEnded",
                table: "FactDisputeSummaries",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TotalArbOwners",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalHearingTimeMin",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalIOOwners",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalPreparationTimeMin",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalStage0TimeMin",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalStage10TimeMin",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalStage2TimeMin",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalStage4TimeMin",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalStage6TimeMin",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalStage8TimeMin",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalStatus102TimeMin",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalStatus22TimeMin",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalStatus41TimeMin",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalWritingTimeMin",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AwardedMonetaryOrders",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "DecisionsInterim",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "DocumentSets",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "EvidenceFilesFromApplicant",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "EvidenceFilesMBFromApplicant",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "EvidenceFilesMBFromRespondent",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "EvidencePackagesFromApplicant",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "EvidencePackagesFromRespondent",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "EvidencefilesFromRespondent",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "IsAdjourned",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "OrdersMonetary",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "OrdersPossession",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "RequestedAmount",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "TenancyEnded",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "TotalArbOwners",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "TotalHearingTimeMin",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "TotalIOOwners",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "TotalPreparationTimeMin",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "TotalStage0TimeMin",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "TotalStage10TimeMin",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "TotalStage2TimeMin",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "TotalStage4TimeMin",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "TotalStage6TimeMin",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "TotalStage8TimeMin",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "TotalStatus102TimeMin",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "TotalStatus22TimeMin",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "TotalStatus41TimeMin",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "TotalWritingTimeMin",
                table: "FactDisputeSummaries");
        }
    }
}
