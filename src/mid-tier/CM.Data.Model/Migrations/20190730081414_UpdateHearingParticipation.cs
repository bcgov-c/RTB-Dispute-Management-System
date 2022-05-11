using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateHearingParticipation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DisputeGuid",
                table: "HearingParticipations",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<string>(
                name: "Street_Address",
                table: "CMSParticipants",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_HearingParticipations_DisputeGuid",
                table: "HearingParticipations",
                column: "DisputeGuid");

            migrationBuilder.AddForeignKey(
                name: "FK_HearingParticipations_Disputes_DisputeGuid",
                table: "HearingParticipations",
                column: "DisputeGuid",
                principalTable: "Disputes",
                principalColumn: "DisputeGuid",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_HearingParticipations_Disputes_DisputeGuid",
                table: "HearingParticipations");

            migrationBuilder.DropIndex(
                name: "IX_HearingParticipations_DisputeGuid",
                table: "HearingParticipations");

            migrationBuilder.DropColumn(
                name: "DisputeGuid",
                table: "HearingParticipations");

            migrationBuilder.AlterColumn<string>(
                name: "Street_Address",
                table: "CMSParticipants",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 200,
                oldNullable: true);
        }
    }
}
