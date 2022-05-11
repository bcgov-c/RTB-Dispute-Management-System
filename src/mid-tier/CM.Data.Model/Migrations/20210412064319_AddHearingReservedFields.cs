using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddHearingReservedFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "HearingReservedById",
                table: "Hearings",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "HearingReservedUntil",
                table: "Hearings",
                type: "timestamp without time zone",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HearingReservedById",
                table: "Hearings");

            migrationBuilder.DropColumn(
                name: "HearingReservedUntil",
                table: "Hearings");
        }
    }
}
