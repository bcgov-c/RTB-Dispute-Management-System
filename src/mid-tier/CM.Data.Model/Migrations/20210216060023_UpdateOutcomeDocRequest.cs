using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateOutcomeDocRequest : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "RequestCompletionDate",
                table: "OutcomeDocRequests",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RequestDate",
                table: "OutcomeDocRequests",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SubmitterDetails",
                table: "OutcomeDocRequests",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RequestCompletionDate",
                table: "OutcomeDocRequests");

            migrationBuilder.DropColumn(
                name: "RequestDate",
                table: "OutcomeDocRequests");

            migrationBuilder.DropColumn(
                name: "SubmitterDetails",
                table: "OutcomeDocRequests");
        }
    }
}
