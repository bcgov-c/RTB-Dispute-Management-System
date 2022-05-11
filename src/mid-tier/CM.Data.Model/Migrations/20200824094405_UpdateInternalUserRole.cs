using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateInternalUserRole : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EngagementType",
                table: "InternalUserRoles",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "ScheduleStatus",
                table: "InternalUserRoles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ScheduleSubStatus",
                table: "InternalUserRoles",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EngagementType",
                table: "InternalUserRoles");

            migrationBuilder.DropColumn(
                name: "ScheduleStatus",
                table: "InternalUserRoles");

            migrationBuilder.DropColumn(
                name: "ScheduleSubStatus",
                table: "InternalUserRoles");
        }
    }
}
