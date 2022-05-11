using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class RenameScheduleHearingToHearing : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ScheduledHearingId",
                table: "ScheduledHearings",
                newName: "HearingId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "HearingId",
                table: "ScheduledHearings",
                newName: "ScheduledHearingId");
        }
    }
}
