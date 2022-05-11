using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateRemedies : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsReviewed",
                table: "Remedies",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PrevAwardBy",
                table: "Remedies",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PrevAwardDate",
                table: "Remedies",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PrevAwardDetails",
                table: "Remedies",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PrevAwardedAmount",
                table: "Remedies",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PrevAwardedDate",
                table: "Remedies",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PrevAwardedDaysAfterService",
                table: "Remedies",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "PrevRemedyStatus",
                table: "Remedies",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "PrevRemedySubStatus",
                table: "Remedies",
                type: "smallint",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsReviewed",
                table: "Remedies");

            migrationBuilder.DropColumn(
                name: "PrevAwardBy",
                table: "Remedies");

            migrationBuilder.DropColumn(
                name: "PrevAwardDate",
                table: "Remedies");

            migrationBuilder.DropColumn(
                name: "PrevAwardDetails",
                table: "Remedies");

            migrationBuilder.DropColumn(
                name: "PrevAwardedAmount",
                table: "Remedies");

            migrationBuilder.DropColumn(
                name: "PrevAwardedDate",
                table: "Remedies");

            migrationBuilder.DropColumn(
                name: "PrevAwardedDaysAfterService",
                table: "Remedies");

            migrationBuilder.DropColumn(
                name: "PrevRemedyStatus",
                table: "Remedies");

            migrationBuilder.DropColumn(
                name: "PrevRemedySubStatus",
                table: "Remedies");
        }
    }
}
