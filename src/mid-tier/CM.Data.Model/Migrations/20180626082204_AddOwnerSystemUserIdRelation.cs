using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddOwnerSystemUserIdRelation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "OwnerSystemUserId",
                table: "Disputes",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.CreateIndex(
                name: "IX_Disputes_OwnerSystemUserId",
                table: "Disputes",
                column: "OwnerSystemUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Disputes_SystemUsers_OwnerSystemUserId",
                table: "Disputes",
                column: "OwnerSystemUserId",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Disputes_SystemUsers_OwnerSystemUserId",
                table: "Disputes");

            migrationBuilder.DropIndex(
                name: "IX_Disputes_OwnerSystemUserId",
                table: "Disputes");

            migrationBuilder.DropColumn(
                name: "OwnerSystemUserId",
                table: "Disputes");
        }
    }
}
