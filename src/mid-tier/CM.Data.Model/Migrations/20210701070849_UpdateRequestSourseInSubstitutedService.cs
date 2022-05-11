using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateRequestSourseInSubstitutedService : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte>(
                name: "RequestSource",
                table: "SubstitutedServices",
                type: "smallint",
                nullable: false,
                defaultValue: (byte)0,
                oldClrType: typeof(byte),
                oldType: "smallint",
                oldNullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte>(
                name: "RequestSource",
                table: "SubstitutedServices",
                type: "smallint",
                nullable: true,
                oldClrType: typeof(byte),
                oldType: "smallint");
        }
    }
}
