using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class ChangeHearingParticipationDisputeNullable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "DisputeGuid",
                table: "HearingParticipations",
                nullable: true,
                oldClrType: typeof(Guid));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "DisputeGuid",
                table: "HearingParticipations",
                nullable: false,
                oldClrType: typeof(Guid),
                oldNullable: true);
        }
    }
}
