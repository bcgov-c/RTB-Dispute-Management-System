using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class RemoveLeftFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notices_Files_FileId",
                table: "Notices");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_Files_FileId1",
                table: "Notices");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_Files_FileId2",
                table: "Notices");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_Files_FileId3",
                table: "Notices");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_Files_FileId4",
                table: "Notices");

            migrationBuilder.DropForeignKey(
                name: "FK_NoticeServices_Files_FileId",
                table: "NoticeServices");

            migrationBuilder.DropForeignKey(
                name: "FK_NoticeServices_Files_FileId1",
                table: "NoticeServices");

            migrationBuilder.DropForeignKey(
                name: "FK_NoticeServices_Files_FileId2",
                table: "NoticeServices");

            migrationBuilder.DropForeignKey(
                name: "FK_NoticeServices_Files_FileId3",
                table: "NoticeServices");

            migrationBuilder.DropForeignKey(
                name: "FK_NoticeServices_Files_FileId4",
                table: "NoticeServices");

            migrationBuilder.DropIndex(
                name: "IX_NoticeServices_FileId",
                table: "NoticeServices");

            migrationBuilder.DropIndex(
                name: "IX_NoticeServices_FileId1",
                table: "NoticeServices");

            migrationBuilder.DropIndex(
                name: "IX_NoticeServices_FileId2",
                table: "NoticeServices");

            migrationBuilder.DropIndex(
                name: "IX_NoticeServices_FileId3",
                table: "NoticeServices");

            migrationBuilder.DropIndex(
                name: "IX_NoticeServices_FileId4",
                table: "NoticeServices");

            migrationBuilder.DropIndex(
                name: "IX_Notices_FileId",
                table: "Notices");

            migrationBuilder.DropIndex(
                name: "IX_Notices_FileId1",
                table: "Notices");

            migrationBuilder.DropIndex(
                name: "IX_Notices_FileId2",
                table: "Notices");

            migrationBuilder.DropIndex(
                name: "IX_Notices_FileId3",
                table: "Notices");

            migrationBuilder.DropIndex(
                name: "IX_Notices_FileId4",
                table: "Notices");

            migrationBuilder.DropColumn(
                name: "FileId",
                table: "NoticeServices");

            migrationBuilder.DropColumn(
                name: "FileId1",
                table: "NoticeServices");

            migrationBuilder.DropColumn(
                name: "FileId2",
                table: "NoticeServices");

            migrationBuilder.DropColumn(
                name: "FileId3",
                table: "NoticeServices");

            migrationBuilder.DropColumn(
                name: "FileId4",
                table: "NoticeServices");

            migrationBuilder.DropColumn(
                name: "FileId",
                table: "Notices");

            migrationBuilder.DropColumn(
                name: "FileId1",
                table: "Notices");

            migrationBuilder.DropColumn(
                name: "FileId2",
                table: "Notices");

            migrationBuilder.DropColumn(
                name: "FileId3",
                table: "Notices");

            migrationBuilder.DropColumn(
                name: "FileId4",
                table: "Notices");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FileId",
                table: "NoticeServices",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FileId1",
                table: "NoticeServices",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FileId2",
                table: "NoticeServices",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FileId3",
                table: "NoticeServices",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FileId4",
                table: "NoticeServices",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FileId",
                table: "Notices",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FileId1",
                table: "Notices",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FileId2",
                table: "Notices",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FileId3",
                table: "Notices",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FileId4",
                table: "Notices",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_NoticeServices_FileId",
                table: "NoticeServices",
                column: "FileId");

            migrationBuilder.CreateIndex(
                name: "IX_NoticeServices_FileId1",
                table: "NoticeServices",
                column: "FileId1");

            migrationBuilder.CreateIndex(
                name: "IX_NoticeServices_FileId2",
                table: "NoticeServices",
                column: "FileId2");

            migrationBuilder.CreateIndex(
                name: "IX_NoticeServices_FileId3",
                table: "NoticeServices",
                column: "FileId3");

            migrationBuilder.CreateIndex(
                name: "IX_NoticeServices_FileId4",
                table: "NoticeServices",
                column: "FileId4");

            migrationBuilder.CreateIndex(
                name: "IX_Notices_FileId",
                table: "Notices",
                column: "FileId");

            migrationBuilder.CreateIndex(
                name: "IX_Notices_FileId1",
                table: "Notices",
                column: "FileId1");

            migrationBuilder.CreateIndex(
                name: "IX_Notices_FileId2",
                table: "Notices",
                column: "FileId2");

            migrationBuilder.CreateIndex(
                name: "IX_Notices_FileId3",
                table: "Notices",
                column: "FileId3");

            migrationBuilder.CreateIndex(
                name: "IX_Notices_FileId4",
                table: "Notices",
                column: "FileId4");

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_Files_FileId",
                table: "Notices",
                column: "FileId",
                principalTable: "Files",
                principalColumn: "FileId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_Files_FileId1",
                table: "Notices",
                column: "FileId1",
                principalTable: "Files",
                principalColumn: "FileId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_Files_FileId2",
                table: "Notices",
                column: "FileId2",
                principalTable: "Files",
                principalColumn: "FileId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_Files_FileId3",
                table: "Notices",
                column: "FileId3",
                principalTable: "Files",
                principalColumn: "FileId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_Files_FileId4",
                table: "Notices",
                column: "FileId4",
                principalTable: "Files",
                principalColumn: "FileId");

            migrationBuilder.AddForeignKey(
                name: "FK_NoticeServices_Files_FileId",
                table: "NoticeServices",
                column: "FileId",
                principalTable: "Files",
                principalColumn: "FileId");

            migrationBuilder.AddForeignKey(
                name: "FK_NoticeServices_Files_FileId1",
                table: "NoticeServices",
                column: "FileId1",
                principalTable: "Files",
                principalColumn: "FileId");

            migrationBuilder.AddForeignKey(
                name: "FK_NoticeServices_Files_FileId2",
                table: "NoticeServices",
                column: "FileId2",
                principalTable: "Files",
                principalColumn: "FileId");

            migrationBuilder.AddForeignKey(
                name: "FK_NoticeServices_Files_FileId3",
                table: "NoticeServices",
                column: "FileId3",
                principalTable: "Files",
                principalColumn: "FileId");

            migrationBuilder.AddForeignKey(
                name: "FK_NoticeServices_Files_FileId4",
                table: "NoticeServices",
                column: "FileId4",
                principalTable: "Files",
                principalColumn: "FileId");
        }
    }
}
