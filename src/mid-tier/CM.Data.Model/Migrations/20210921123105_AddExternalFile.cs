using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddExternalFile : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExternalFile_ExternalCustomDataObjects_ExternalCustomDataOb~",
                table: "ExternalFile");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ExternalFile",
                table: "ExternalFile");

            migrationBuilder.RenameTable(
                name: "ExternalFile",
                newName: "ExternalFiles");

            migrationBuilder.RenameIndex(
                name: "IX_ExternalFile_ExternalCustomDataObjectId",
                table: "ExternalFiles",
                newName: "IX_ExternalFiles_ExternalCustomDataObjectId");

            migrationBuilder.AlterColumn<byte>(
                name: "ObjectType",
                table: "CustomDataObjects",
                type: "smallint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ExternalFiles",
                table: "ExternalFiles",
                column: "ExternalFileId");

            migrationBuilder.AddForeignKey(
                name: "FK_ExternalFiles_ExternalCustomDataObjects_ExternalCustomDataO~",
                table: "ExternalFiles",
                column: "ExternalCustomDataObjectId",
                principalTable: "ExternalCustomDataObjects",
                principalColumn: "ExternalCustomDataObjectId",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExternalFiles_ExternalCustomDataObjects_ExternalCustomDataO~",
                table: "ExternalFiles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ExternalFiles",
                table: "ExternalFiles");

            migrationBuilder.RenameTable(
                name: "ExternalFiles",
                newName: "ExternalFile");

            migrationBuilder.RenameIndex(
                name: "IX_ExternalFiles_ExternalCustomDataObjectId",
                table: "ExternalFile",
                newName: "IX_ExternalFile_ExternalCustomDataObjectId");

            migrationBuilder.AlterColumn<int>(
                name: "ObjectType",
                table: "CustomDataObjects",
                type: "integer",
                nullable: false,
                oldClrType: typeof(byte),
                oldType: "smallint");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ExternalFile",
                table: "ExternalFile",
                column: "ExternalFileId");

            migrationBuilder.AddForeignKey(
                name: "FK_ExternalFile_ExternalCustomDataObjects_ExternalCustomDataOb~",
                table: "ExternalFile",
                column: "ExternalCustomDataObjectId",
                principalTable: "ExternalCustomDataObjects",
                principalColumn: "ExternalCustomDataObjectId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
