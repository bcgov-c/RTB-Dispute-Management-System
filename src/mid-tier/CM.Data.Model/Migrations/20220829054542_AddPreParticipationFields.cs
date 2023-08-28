using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AddPreParticipationFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ParticipationStatusBy",
                table: "HearingParticipations",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PreParticipationStatusBy",
                table: "HearingParticipations",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PreParticipationStatusDate",
                table: "HearingParticipations",
                type: "timestamp with time zone",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ParticipationStatusBy",
                table: "HearingParticipations");

            migrationBuilder.DropColumn(
                name: "PreParticipationStatusBy",
                table: "HearingParticipations");

            migrationBuilder.DropColumn(
                name: "PreParticipationStatusDate",
                table: "HearingParticipations");
        }
    }
}
