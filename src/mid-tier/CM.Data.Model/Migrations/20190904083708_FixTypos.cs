using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class FixTypos : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DisputeHearings_ConferenceBridges_NoticeConferenceBridgeID",
                table: "DisputeHearings");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_ConferenceBridges_ConferenceBridgeID",
                table: "Notices");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_FileDescriptions_NoticeFileDescriptionID",
                table: "Notices");

            migrationBuilder.DropForeignKey(
                name: "FK_NoticeServices_FileDescriptions_ProofFileDescriptionID",
                table: "NoticeServices");

            migrationBuilder.RenameColumn(
                name: "SecondaaryPhone",
                table: "Participants",
                newName: "SecondaryPhone");

            migrationBuilder.RenameColumn(
                name: "ProofFileDescriptionID",
                table: "NoticeServices",
                newName: "ProofFileDescriptionId");

            migrationBuilder.RenameIndex(
                name: "IX_NoticeServices_ProofFileDescriptionID",
                table: "NoticeServices",
                newName: "IX_NoticeServices_ProofFileDescriptionId");

            migrationBuilder.RenameColumn(
                name: "NoticeFileDescriptionID",
                table: "Notices",
                newName: "NoticeFileDescriptionId");

            migrationBuilder.RenameColumn(
                name: "ConferenceBridgeID",
                table: "Notices",
                newName: "ConferenceBridgeId");

            migrationBuilder.RenameIndex(
                name: "IX_Notices_NoticeFileDescriptionID",
                table: "Notices",
                newName: "IX_Notices_NoticeFileDescriptionId");

            migrationBuilder.RenameIndex(
                name: "IX_Notices_ConferenceBridgeID",
                table: "Notices",
                newName: "IX_Notices_ConferenceBridgeId");

            migrationBuilder.RenameColumn(
                name: "NoticeConferenceBridgeID",
                table: "DisputeHearings",
                newName: "NoticeConferenceBridgeId");

            migrationBuilder.RenameIndex(
                name: "IX_DisputeHearings_NoticeConferenceBridgeID",
                table: "DisputeHearings",
                newName: "IX_DisputeHearings_NoticeConferenceBridgeId");

            migrationBuilder.AddForeignKey(
                name: "FK_DisputeHearings_ConferenceBridges_NoticeConferenceBridgeId",
                table: "DisputeHearings",
                column: "NoticeConferenceBridgeId",
                principalTable: "ConferenceBridges",
                principalColumn: "ConferenceBridgeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_ConferenceBridges_ConferenceBridgeId",
                table: "Notices",
                column: "ConferenceBridgeId",
                principalTable: "ConferenceBridges",
                principalColumn: "ConferenceBridgeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_FileDescriptions_NoticeFileDescriptionId",
                table: "Notices",
                column: "NoticeFileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_NoticeServices_FileDescriptions_ProofFileDescriptionId",
                table: "NoticeServices",
                column: "ProofFileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DisputeHearings_ConferenceBridges_NoticeConferenceBridgeId",
                table: "DisputeHearings");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_ConferenceBridges_ConferenceBridgeId",
                table: "Notices");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_FileDescriptions_NoticeFileDescriptionId",
                table: "Notices");

            migrationBuilder.DropForeignKey(
                name: "FK_NoticeServices_FileDescriptions_ProofFileDescriptionId",
                table: "NoticeServices");

            migrationBuilder.RenameColumn(
                name: "SecondaryPhone",
                table: "Participants",
                newName: "SecondaaryPhone");

            migrationBuilder.RenameColumn(
                name: "ProofFileDescriptionId",
                table: "NoticeServices",
                newName: "ProofFileDescriptionID");

            migrationBuilder.RenameIndex(
                name: "IX_NoticeServices_ProofFileDescriptionId",
                table: "NoticeServices",
                newName: "IX_NoticeServices_ProofFileDescriptionID");

            migrationBuilder.RenameColumn(
                name: "NoticeFileDescriptionId",
                table: "Notices",
                newName: "NoticeFileDescriptionID");

            migrationBuilder.RenameColumn(
                name: "ConferenceBridgeId",
                table: "Notices",
                newName: "ConferenceBridgeID");

            migrationBuilder.RenameIndex(
                name: "IX_Notices_NoticeFileDescriptionId",
                table: "Notices",
                newName: "IX_Notices_NoticeFileDescriptionID");

            migrationBuilder.RenameIndex(
                name: "IX_Notices_ConferenceBridgeId",
                table: "Notices",
                newName: "IX_Notices_ConferenceBridgeID");

            migrationBuilder.RenameColumn(
                name: "NoticeConferenceBridgeId",
                table: "DisputeHearings",
                newName: "NoticeConferenceBridgeID");

            migrationBuilder.RenameIndex(
                name: "IX_DisputeHearings_NoticeConferenceBridgeId",
                table: "DisputeHearings",
                newName: "IX_DisputeHearings_NoticeConferenceBridgeID");

            migrationBuilder.AddForeignKey(
                name: "FK_DisputeHearings_ConferenceBridges_NoticeConferenceBridgeID",
                table: "DisputeHearings",
                column: "NoticeConferenceBridgeID",
                principalTable: "ConferenceBridges",
                principalColumn: "ConferenceBridgeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_ConferenceBridges_ConferenceBridgeID",
                table: "Notices",
                column: "ConferenceBridgeID",
                principalTable: "ConferenceBridges",
                principalColumn: "ConferenceBridgeId",
                onDelete: ReferentialAction.Restrict);

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
    }
}
