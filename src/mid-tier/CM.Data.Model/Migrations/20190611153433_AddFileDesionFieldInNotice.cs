using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddFileDesionFieldInNotice : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProofFileDescriptionID",
                table: "NoticeServices",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NoticeFileDescriptionID",
                table: "Notices",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_NoticeServices_ProofFileDescriptionID",
                table: "NoticeServices",
                column: "ProofFileDescriptionID");

            migrationBuilder.CreateIndex(
                name: "IX_Notices_NoticeFileDescriptionID",
                table: "Notices",
                column: "NoticeFileDescriptionID");

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_FileDescriptions_NoticeFileDescriptionID",
                table: "Notices",
                column: "NoticeFileDescriptionID",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_NoticeServices_FileDescriptions_ProofFileDescriptionID",
                table: "NoticeServices",
                column: "ProofFileDescriptionID",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notices_FileDescriptions_NoticeFileDescriptionID",
                table: "Notices");

            migrationBuilder.DropForeignKey(
                name: "FK_NoticeServices_FileDescriptions_ProofFileDescriptionID",
                table: "NoticeServices");

            migrationBuilder.DropIndex(
                name: "IX_NoticeServices_ProofFileDescriptionID",
                table: "NoticeServices");

            migrationBuilder.DropIndex(
                name: "IX_Notices_NoticeFileDescriptionID",
                table: "Notices");

            migrationBuilder.DropColumn(
                name: "ProofFileDescriptionID",
                table: "NoticeServices");

            migrationBuilder.DropColumn(
                name: "NoticeFileDescriptionID",
                table: "Notices");
        }
    }
}
