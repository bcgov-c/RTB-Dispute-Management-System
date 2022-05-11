using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddFieldsToClaimAndRemedy : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AwardDetails",
                table: "Remedies",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "AwardedAmount",
                table: "Remedies",
                type: "decimal(10,2)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AwardedDate",
                table: "Remedies",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AwardedDaysAfterService",
                table: "Remedies",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RemedyStatsReason",
                table: "Remedies",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "RemedySubStatus",
                table: "Remedies",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "ClaimStatusReason",
                table: "Claims",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AwardDetails",
                table: "Remedies");

            migrationBuilder.DropColumn(
                name: "AwardedAmount",
                table: "Remedies");

            migrationBuilder.DropColumn(
                name: "AwardedDate",
                table: "Remedies");

            migrationBuilder.DropColumn(
                name: "AwardedDaysAfterService",
                table: "Remedies");

            migrationBuilder.DropColumn(
                name: "RemedyStatsReason",
                table: "Remedies");

            migrationBuilder.DropColumn(
                name: "RemedySubStatus",
                table: "Remedies");

            migrationBuilder.DropColumn(
                name: "ClaimStatusReason",
                table: "Claims");
        }
    }
}
