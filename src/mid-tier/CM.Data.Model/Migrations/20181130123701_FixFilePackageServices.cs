using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class FixFilePackageServices : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FilePackageService_FilePackages_FilePackageId",
                table: "FilePackageService");

            migrationBuilder.DropForeignKey(
                name: "FK_FilePackageService_Participants_ParticipantId",
                table: "FilePackageService");

            migrationBuilder.DropForeignKey(
                name: "FK_FilePackageService_Participants_ServedBy",
                table: "FilePackageService");

            migrationBuilder.DropPrimaryKey(
                name: "PK_FilePackageService",
                table: "FilePackageService");

            migrationBuilder.RenameTable(
                name: "FilePackageService",
                newName: "FilePackageServices");

            migrationBuilder.RenameIndex(
                name: "IX_FilePackageService_ServedBy",
                table: "FilePackageServices",
                newName: "IX_FilePackageServices_ServedBy");

            migrationBuilder.RenameIndex(
                name: "IX_FilePackageService_ParticipantId",
                table: "FilePackageServices",
                newName: "IX_FilePackageServices_ParticipantId");

            migrationBuilder.RenameIndex(
                name: "IX_FilePackageService_FilePackageId",
                table: "FilePackageServices",
                newName: "IX_FilePackageServices_FilePackageId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_FilePackageServices",
                table: "FilePackageServices",
                column: "FilePackageServiceId");

            migrationBuilder.AddForeignKey(
                name: "FK_FilePackageServices_FilePackages_FilePackageId",
                table: "FilePackageServices",
                column: "FilePackageId",
                principalTable: "FilePackages",
                principalColumn: "FilePackageId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FilePackageServices_Participants_ParticipantId",
                table: "FilePackageServices",
                column: "ParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FilePackageServices_Participants_ServedBy",
                table: "FilePackageServices",
                column: "ServedBy",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FilePackageServices_FilePackages_FilePackageId",
                table: "FilePackageServices");

            migrationBuilder.DropForeignKey(
                name: "FK_FilePackageServices_Participants_ParticipantId",
                table: "FilePackageServices");

            migrationBuilder.DropForeignKey(
                name: "FK_FilePackageServices_Participants_ServedBy",
                table: "FilePackageServices");

            migrationBuilder.DropPrimaryKey(
                name: "PK_FilePackageServices",
                table: "FilePackageServices");

            migrationBuilder.RenameTable(
                name: "FilePackageServices",
                newName: "FilePackageService");

            migrationBuilder.RenameIndex(
                name: "IX_FilePackageServices_ServedBy",
                table: "FilePackageService",
                newName: "IX_FilePackageService_ServedBy");

            migrationBuilder.RenameIndex(
                name: "IX_FilePackageServices_ParticipantId",
                table: "FilePackageService",
                newName: "IX_FilePackageService_ParticipantId");

            migrationBuilder.RenameIndex(
                name: "IX_FilePackageServices_FilePackageId",
                table: "FilePackageService",
                newName: "IX_FilePackageService_FilePackageId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_FilePackageService",
                table: "FilePackageService",
                column: "FilePackageServiceId");

            migrationBuilder.AddForeignKey(
                name: "FK_FilePackageService_FilePackages_FilePackageId",
                table: "FilePackageService",
                column: "FilePackageId",
                principalTable: "FilePackages",
                principalColumn: "FilePackageId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FilePackageService_Participants_ParticipantId",
                table: "FilePackageService",
                column: "ParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FilePackageService_Participants_ServedBy",
                table: "FilePackageService",
                column: "ServedBy",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
