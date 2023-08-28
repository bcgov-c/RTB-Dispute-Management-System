using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class DeleteNoticesFilesFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notices_Files_NoticeFile1Id",
                table: "Notices");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_Files_NoticeFile2Id",
                table: "Notices");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_Files_NoticeFile3Id",
                table: "Notices");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_Files_NoticeFile4Id",
                table: "Notices");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_Files_NoticeFile5Id",
                table: "Notices");

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

            migrationBuilder.RenameColumn(
                name: "NoticeServiceFile5Id",
                table: "NoticeServices",
                newName: "FileId4");

            migrationBuilder.RenameColumn(
                name: "NoticeServiceFile4Id",
                table: "NoticeServices",
                newName: "FileId3");

            migrationBuilder.RenameColumn(
                name: "NoticeServiceFile3Id",
                table: "NoticeServices",
                newName: "FileId2");

            migrationBuilder.RenameColumn(
                name: "NoticeServiceFile2Id",
                table: "NoticeServices",
                newName: "FileId1");

            migrationBuilder.RenameColumn(
                name: "NoticeServiceFile1Id",
                table: "NoticeServices",
                newName: "FileId");

            migrationBuilder.RenameIndex(
                name: "IX_NoticeServices_NoticeServiceFile5Id",
                table: "NoticeServices",
                newName: "IX_NoticeServices_FileId4");

            migrationBuilder.RenameIndex(
                name: "IX_NoticeServices_NoticeServiceFile4Id",
                table: "NoticeServices",
                newName: "IX_NoticeServices_FileId3");

            migrationBuilder.RenameIndex(
                name: "IX_NoticeServices_NoticeServiceFile3Id",
                table: "NoticeServices",
                newName: "IX_NoticeServices_FileId2");

            migrationBuilder.RenameIndex(
                name: "IX_NoticeServices_NoticeServiceFile2Id",
                table: "NoticeServices",
                newName: "IX_NoticeServices_FileId1");

            migrationBuilder.RenameIndex(
                name: "IX_NoticeServices_NoticeServiceFile1Id",
                table: "NoticeServices",
                newName: "IX_NoticeServices_FileId");

            migrationBuilder.RenameColumn(
                name: "NoticeFile5Id",
                table: "Notices",
                newName: "FileId4");

            migrationBuilder.RenameColumn(
                name: "NoticeFile4Id",
                table: "Notices",
                newName: "FileId3");

            migrationBuilder.RenameColumn(
                name: "NoticeFile3Id",
                table: "Notices",
                newName: "FileId2");

            migrationBuilder.RenameColumn(
                name: "NoticeFile2Id",
                table: "Notices",
                newName: "FileId1");

            migrationBuilder.RenameColumn(
                name: "NoticeFile1Id",
                table: "Notices",
                newName: "FileId");

            migrationBuilder.RenameIndex(
                name: "IX_Notices_NoticeFile5Id",
                table: "Notices",
                newName: "IX_Notices_FileId4");

            migrationBuilder.RenameIndex(
                name: "IX_Notices_NoticeFile4Id",
                table: "Notices",
                newName: "IX_Notices_FileId3");

            migrationBuilder.RenameIndex(
                name: "IX_Notices_NoticeFile3Id",
                table: "Notices",
                newName: "IX_Notices_FileId2");

            migrationBuilder.RenameIndex(
                name: "IX_Notices_NoticeFile2Id",
                table: "Notices",
                newName: "IX_Notices_FileId1");

            migrationBuilder.RenameIndex(
                name: "IX_Notices_NoticeFile1Id",
                table: "Notices",
                newName: "IX_Notices_FileId");

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

        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.RenameColumn(
                name: "FileId4",
                table: "NoticeServices",
                newName: "NoticeServiceFile5Id");

            migrationBuilder.RenameColumn(
                name: "FileId3",
                table: "NoticeServices",
                newName: "NoticeServiceFile4Id");

            migrationBuilder.RenameColumn(
                name: "FileId2",
                table: "NoticeServices",
                newName: "NoticeServiceFile3Id");

            migrationBuilder.RenameColumn(
                name: "FileId1",
                table: "NoticeServices",
                newName: "NoticeServiceFile2Id");

            migrationBuilder.RenameColumn(
                name: "FileId",
                table: "NoticeServices",
                newName: "NoticeServiceFile1Id");

            migrationBuilder.RenameIndex(
                name: "IX_NoticeServices_FileId4",
                table: "NoticeServices",
                newName: "IX_NoticeServices_NoticeServiceFile5Id");

            migrationBuilder.RenameIndex(
                name: "IX_NoticeServices_FileId3",
                table: "NoticeServices",
                newName: "IX_NoticeServices_NoticeServiceFile4Id");

            migrationBuilder.RenameIndex(
                name: "IX_NoticeServices_FileId2",
                table: "NoticeServices",
                newName: "IX_NoticeServices_NoticeServiceFile3Id");

            migrationBuilder.RenameIndex(
                name: "IX_NoticeServices_FileId1",
                table: "NoticeServices",
                newName: "IX_NoticeServices_NoticeServiceFile2Id");

            migrationBuilder.RenameIndex(
                name: "IX_NoticeServices_FileId",
                table: "NoticeServices",
                newName: "IX_NoticeServices_NoticeServiceFile1Id");

            migrationBuilder.RenameColumn(
                name: "FileId4",
                table: "Notices",
                newName: "NoticeFile5Id");

            migrationBuilder.RenameColumn(
                name: "FileId3",
                table: "Notices",
                newName: "NoticeFile4Id");

            migrationBuilder.RenameColumn(
                name: "FileId2",
                table: "Notices",
                newName: "NoticeFile3Id");

            migrationBuilder.RenameColumn(
                name: "FileId1",
                table: "Notices",
                newName: "NoticeFile2Id");

            migrationBuilder.RenameColumn(
                name: "FileId",
                table: "Notices",
                newName: "NoticeFile1Id");

            migrationBuilder.RenameIndex(
                name: "IX_Notices_FileId4",
                table: "Notices",
                newName: "IX_Notices_NoticeFile5Id");

            migrationBuilder.RenameIndex(
                name: "IX_Notices_FileId3",
                table: "Notices",
                newName: "IX_Notices_NoticeFile4Id");

            migrationBuilder.RenameIndex(
                name: "IX_Notices_FileId2",
                table: "Notices",
                newName: "IX_Notices_NoticeFile3Id");

            migrationBuilder.RenameIndex(
                name: "IX_Notices_FileId1",
                table: "Notices",
                newName: "IX_Notices_NoticeFile2Id");

            migrationBuilder.RenameIndex(
                name: "IX_Notices_FileId",
                table: "Notices",
                newName: "IX_Notices_NoticeFile1Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_Files_NoticeFile1Id",
                table: "Notices",
                column: "NoticeFile1Id",
                principalTable: "Files",
                principalColumn: "FileId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_Files_NoticeFile2Id",
                table: "Notices",
                column: "NoticeFile2Id",
                principalTable: "Files",
                principalColumn: "FileId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_Files_NoticeFile3Id",
                table: "Notices",
                column: "NoticeFile3Id",
                principalTable: "Files",
                principalColumn: "FileId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_Files_NoticeFile4Id",
                table: "Notices",
                column: "NoticeFile4Id",
                principalTable: "Files",
                principalColumn: "FileId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_Files_NoticeFile5Id",
                table: "Notices",
                column: "NoticeFile5Id",
                principalTable: "Files",
                principalColumn: "FileId",
                onDelete: ReferentialAction.Restrict);

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
    }
}
