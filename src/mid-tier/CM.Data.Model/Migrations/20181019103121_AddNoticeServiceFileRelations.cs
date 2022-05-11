using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddNoticeServiceFileRelations : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "NoticeServiceFile1Id",
                table: "NoticeServices",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NoticeServiceFile2Id",
                table: "NoticeServices",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NoticeServiceFile3Id",
                table: "NoticeServices",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NoticeServiceFile4Id",
                table: "NoticeServices",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NoticeServiceFile5Id",
                table: "NoticeServices",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_NoticeServices_NoticeServiceFile1Id",
                table: "NoticeServices",
                column: "NoticeServiceFile1Id");

            migrationBuilder.CreateIndex(
                name: "IX_NoticeServices_NoticeServiceFile2Id",
                table: "NoticeServices",
                column: "NoticeServiceFile2Id");

            migrationBuilder.CreateIndex(
                name: "IX_NoticeServices_NoticeServiceFile3Id",
                table: "NoticeServices",
                column: "NoticeServiceFile3Id");

            migrationBuilder.CreateIndex(
                name: "IX_NoticeServices_NoticeServiceFile4Id",
                table: "NoticeServices",
                column: "NoticeServiceFile4Id");

            migrationBuilder.CreateIndex(
                name: "IX_NoticeServices_NoticeServiceFile5Id",
                table: "NoticeServices",
                column: "NoticeServiceFile5Id");

            migrationBuilder.AddForeignKey(
                name: "FK_NoticeServices_Files_NoticeServiceFile1Id",
                table: "NoticeServices",
                column: "NoticeServiceFile1Id",
                principalTable: "Files",
                principalColumn: "FileId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_NoticeServices_Files_NoticeServiceFile2Id",
                table: "NoticeServices",
                column: "NoticeServiceFile2Id",
                principalTable: "Files",
                principalColumn: "FileId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_NoticeServices_Files_NoticeServiceFile3Id",
                table: "NoticeServices",
                column: "NoticeServiceFile3Id",
                principalTable: "Files",
                principalColumn: "FileId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_NoticeServices_Files_NoticeServiceFile4Id",
                table: "NoticeServices",
                column: "NoticeServiceFile4Id",
                principalTable: "Files",
                principalColumn: "FileId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_NoticeServices_Files_NoticeServiceFile5Id",
                table: "NoticeServices",
                column: "NoticeServiceFile5Id",
                principalTable: "Files",
                principalColumn: "FileId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_NoticeServices_Files_NoticeServiceFile1Id",
                table: "NoticeServices");

            migrationBuilder.DropForeignKey(
                name: "FK_NoticeServices_Files_NoticeServiceFile2Id",
                table: "NoticeServices");

            migrationBuilder.DropForeignKey(
                name: "FK_NoticeServices_Files_NoticeServiceFile3Id",
                table: "NoticeServices");

            migrationBuilder.DropForeignKey(
                name: "FK_NoticeServices_Files_NoticeServiceFile4Id",
                table: "NoticeServices");

            migrationBuilder.DropForeignKey(
                name: "FK_NoticeServices_Files_NoticeServiceFile5Id",
                table: "NoticeServices");

            migrationBuilder.DropIndex(
                name: "IX_NoticeServices_NoticeServiceFile1Id",
                table: "NoticeServices");

            migrationBuilder.DropIndex(
                name: "IX_NoticeServices_NoticeServiceFile2Id",
                table: "NoticeServices");

            migrationBuilder.DropIndex(
                name: "IX_NoticeServices_NoticeServiceFile3Id",
                table: "NoticeServices");

            migrationBuilder.DropIndex(
                name: "IX_NoticeServices_NoticeServiceFile4Id",
                table: "NoticeServices");

            migrationBuilder.DropIndex(
                name: "IX_NoticeServices_NoticeServiceFile5Id",
                table: "NoticeServices");

            migrationBuilder.DropColumn(
                name: "NoticeServiceFile1Id",
                table: "NoticeServices");

            migrationBuilder.DropColumn(
                name: "NoticeServiceFile2Id",
                table: "NoticeServices");

            migrationBuilder.DropColumn(
                name: "NoticeServiceFile3Id",
                table: "NoticeServices");

            migrationBuilder.DropColumn(
                name: "NoticeServiceFile4Id",
                table: "NoticeServices");

            migrationBuilder.DropColumn(
                name: "NoticeServiceFile5Id",
                table: "NoticeServices");
        }
    }
}
