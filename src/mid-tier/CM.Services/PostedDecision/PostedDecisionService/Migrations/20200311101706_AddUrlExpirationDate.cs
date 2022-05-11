using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.PostedDecision.PostedDecisionDataService.Migrations
{
    public partial class AddUrlExpirationDate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "UrlExpirationDate",
                table: "PostedDecisions",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UrlExpirationDate",
                table: "PostedDecisions");
        }
    }
}
