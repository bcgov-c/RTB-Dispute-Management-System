using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddAmendFileDescriptionField : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AmendFileDescriptionId",
                table: "Amendments",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Amendments_AmendFileDescriptionId",
                table: "Amendments",
                column: "AmendFileDescriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Amendments_FileDescriptions_AmendFileDescriptionId",
                table: "Amendments",
                column: "AmendFileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Amendments_FileDescriptions_AmendFileDescriptionId",
                table: "Amendments");

            migrationBuilder.DropIndex(
                name: "IX_Amendments_AmendFileDescriptionId",
                table: "Amendments");

            migrationBuilder.DropColumn(
                name: "AmendFileDescriptionId",
                table: "Amendments");
        }
    }
}
