using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class FixConferenceBridgeFieldsName : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ConferenceBridges_SystemUsers_PreferedOwner",
                table: "ConferenceBridges");

            migrationBuilder.RenameColumn(
                name: "PreferedStartTime",
                table: "ConferenceBridges",
                newName: "PreferredStartTime");

            migrationBuilder.RenameColumn(
                name: "PreferedOwner",
                table: "ConferenceBridges",
                newName: "PreferredOwner");

            migrationBuilder.RenameColumn(
                name: "PreferedEndTime",
                table: "ConferenceBridges",
                newName: "PreferredEndTime");

            migrationBuilder.RenameIndex(
                name: "IX_ConferenceBridges_PreferedOwner",
                table: "ConferenceBridges",
                newName: "IX_ConferenceBridges_PreferredOwner");

            migrationBuilder.AddForeignKey(
                name: "FK_ConferenceBridges_SystemUsers_PreferredOwner",
                table: "ConferenceBridges",
                column: "PreferredOwner",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ConferenceBridges_SystemUsers_PreferredOwner",
                table: "ConferenceBridges");

            migrationBuilder.RenameColumn(
                name: "PreferredStartTime",
                table: "ConferenceBridges",
                newName: "PreferedStartTime");

            migrationBuilder.RenameColumn(
                name: "PreferredOwner",
                table: "ConferenceBridges",
                newName: "PreferedOwner");

            migrationBuilder.RenameColumn(
                name: "PreferredEndTime",
                table: "ConferenceBridges",
                newName: "PreferedEndTime");

            migrationBuilder.RenameIndex(
                name: "IX_ConferenceBridges_PreferredOwner",
                table: "ConferenceBridges",
                newName: "IX_ConferenceBridges_PreferedOwner");

            migrationBuilder.AddForeignKey(
                name: "FK_ConferenceBridges_SystemUsers_PreferedOwner",
                table: "ConferenceBridges",
                column: "PreferedOwner",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
