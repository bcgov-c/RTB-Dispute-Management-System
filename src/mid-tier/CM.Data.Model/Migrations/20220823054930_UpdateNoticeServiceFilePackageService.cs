using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class UpdateNoticeServiceFilePackageService : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "OtherProofFileDescriptionId",
                table: "ServiceAuditLogs",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ServiceDescription",
                table: "ServiceAuditLogs",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ArchiveServiceDescription",
                table: "NoticeServices",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OtherProofFileDescriptionId",
                table: "NoticeServices",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ServiceDescription",
                table: "NoticeServices",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ArchiveServiceDescription",
                table: "FilePackageServices",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OtherProofFileDescriptionId",
                table: "FilePackageServices",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ServiceDescription",
                table: "FilePackageServices",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_NoticeServices_OtherProofFileDescriptionId",
                table: "NoticeServices",
                column: "OtherProofFileDescriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_FilePackageServices_OtherProofFileDescriptionId",
                table: "FilePackageServices",
                column: "OtherProofFileDescriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_FilePackageServices_FileDescriptions_OtherProofFileDescript~",
                table: "FilePackageServices",
                column: "OtherProofFileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_NoticeServices_FileDescriptions_OtherProofFileDescriptionId",
                table: "NoticeServices",
                column: "OtherProofFileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FilePackageServices_FileDescriptions_OtherProofFileDescript~",
                table: "FilePackageServices");

            migrationBuilder.DropForeignKey(
                name: "FK_NoticeServices_FileDescriptions_OtherProofFileDescriptionId",
                table: "NoticeServices");

            migrationBuilder.DropIndex(
                name: "IX_NoticeServices_OtherProofFileDescriptionId",
                table: "NoticeServices");

            migrationBuilder.DropIndex(
                name: "IX_FilePackageServices_OtherProofFileDescriptionId",
                table: "FilePackageServices");

            migrationBuilder.DropColumn(
                name: "OtherProofFileDescriptionId",
                table: "ServiceAuditLogs");

            migrationBuilder.DropColumn(
                name: "ServiceDescription",
                table: "ServiceAuditLogs");

            migrationBuilder.DropColumn(
                name: "ArchiveServiceDescription",
                table: "NoticeServices");

            migrationBuilder.DropColumn(
                name: "OtherProofFileDescriptionId",
                table: "NoticeServices");

            migrationBuilder.DropColumn(
                name: "ServiceDescription",
                table: "NoticeServices");

            migrationBuilder.DropColumn(
                name: "ArchiveServiceDescription",
                table: "FilePackageServices");

            migrationBuilder.DropColumn(
                name: "OtherProofFileDescriptionId",
                table: "FilePackageServices");

            migrationBuilder.DropColumn(
                name: "ServiceDescription",
                table: "FilePackageServices");
        }
    }
}
