using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateDisputeHearingRole : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte>(
                name: "DisputeHearingRole",
                table: "HearingAuditLogs",
                nullable: true,
                oldClrType: typeof(byte),
                oldType: "smallint");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte>(
                name: "DisputeHearingRole",
                table: "HearingAuditLogs",
                type: "smallint",
                nullable: false,
                oldClrType: typeof(byte),
                oldNullable: true);
        }
    }
}
