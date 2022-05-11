using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddServiceOfficeIdToSystemUsers : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ServiceOfficeId",
                table: "SystemUsers",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SystemUsers_ServiceOfficeId",
                table: "SystemUsers",
                column: "ServiceOfficeId");

            migrationBuilder.AddForeignKey(
                name: "FK_SystemUsers_ServiceOffices_ServiceOfficeId",
                table: "SystemUsers",
                column: "ServiceOfficeId",
                principalTable: "ServiceOffices",
                principalColumn: "ServiceOfficeId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SystemUsers_ServiceOffices_ServiceOfficeId",
                table: "SystemUsers");

            migrationBuilder.DropIndex(
                name: "IX_SystemUsers_ServiceOfficeId",
                table: "SystemUsers");

            migrationBuilder.DropColumn(
                name: "ServiceOfficeId",
                table: "SystemUsers");
        }
    }
}
