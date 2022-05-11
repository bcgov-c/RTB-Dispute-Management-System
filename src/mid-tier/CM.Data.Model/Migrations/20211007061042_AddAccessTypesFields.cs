using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddAccessTypesFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte>(
                name: "AccessSubTypes",
                table: "InternalUserRoles",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "AccessTypes",
                table: "InternalUserRoles",
                type: "smallint",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccessSubTypes",
                table: "InternalUserRoles");

            migrationBuilder.DropColumn(
                name: "AccessTypes",
                table: "InternalUserRoles");
        }
    }
}
