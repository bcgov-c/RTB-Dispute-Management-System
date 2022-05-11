using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.PostedDecision.PostedDecisionDataService.Migrations
{
    public partial class RemoveCreatedModifiedByDate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "PostedDecisions");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "PostedDecisions");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "PostedDecisions");

            migrationBuilder.DropColumn(
                name: "ModifiedDate",
                table: "PostedDecisions");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CreatedBy",
                table: "PostedDecisions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "PostedDecisions",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ModifiedBy",
                table: "PostedDecisions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedDate",
                table: "PostedDecisions",
                type: "timestamp without time zone",
                nullable: true);
        }
    }
}
