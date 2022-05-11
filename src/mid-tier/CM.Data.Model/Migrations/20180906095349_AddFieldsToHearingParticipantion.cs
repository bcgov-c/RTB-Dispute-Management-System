using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddFieldsToHearingParticipantion : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NameAbbreviation",
                table: "HearingParticipations",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "OtherParticipantAssociation",
                table: "HearingParticipations",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OtherParticipantTitle",
                table: "HearingParticipations",
                maxLength: 255,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NameAbbreviation",
                table: "HearingParticipations");

            migrationBuilder.DropColumn(
                name: "OtherParticipantAssociation",
                table: "HearingParticipations");

            migrationBuilder.DropColumn(
                name: "OtherParticipantTitle",
                table: "HearingParticipations");
        }
    }
}
