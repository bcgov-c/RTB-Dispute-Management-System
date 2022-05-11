using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateHearingParticipation1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PreParticipationComment",
                table: "HearingParticipations",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "PreParticipationStatus",
                table: "HearingParticipations",
                type: "smallint",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PreParticipationComment",
                table: "HearingParticipations");

            migrationBuilder.DropColumn(
                name: "PreParticipationStatus",
                table: "HearingParticipations");
        }
    }
}
