using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateSharedHearingLinkTypeNullable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte>(
                name: "SharedHearingLinkType",
                table: "DisputeHearings",
                nullable: true,
                oldClrType: typeof(byte));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte>(
                name: "SharedHearingLinkType",
                table: "DisputeHearings",
                nullable: false,
                oldClrType: typeof(byte),
                oldNullable: true);
        }
    }
}
