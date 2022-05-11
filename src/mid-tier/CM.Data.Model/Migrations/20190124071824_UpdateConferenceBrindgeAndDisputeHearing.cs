using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateConferenceBrindgeAndDisputeHearing : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DisputeHearings_Notices_NoticeID",
                table: "DisputeHearings");

            migrationBuilder.DropColumn(
                name: "NoticeHearingStartDateTime",
                table: "DisputeHearings");

            migrationBuilder.RenameColumn(
                name: "NoticeID",
                table: "DisputeHearings",
                newName: "NoticeConferenceBridgeID");

            migrationBuilder.RenameIndex(
                name: "IX_DisputeHearings_NoticeID",
                table: "DisputeHearings",
                newName: "IX_DisputeHearings_NoticeConferenceBridgeID");

            migrationBuilder.AddColumn<int>(
                name: "ConferenceBridgeID",
                table: "Notices",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalFileId",
                table: "DisputeHearings",
                maxLength: 12,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notices_ConferenceBridgeID",
                table: "Notices",
                column: "ConferenceBridgeID");

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
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DisputeHearings_ConferenceBridges_NoticeConferenceBridgeID",
                table: "DisputeHearings");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_ConferenceBridges_ConferenceBridgeID",
                table: "Notices");

            migrationBuilder.DropIndex(
                name: "IX_Notices_ConferenceBridgeID",
                table: "Notices");

            migrationBuilder.DropColumn(
                name: "ConferenceBridgeID",
                table: "Notices");

            migrationBuilder.DropColumn(
                name: "ExternalFileId",
                table: "DisputeHearings");

            migrationBuilder.RenameColumn(
                name: "NoticeConferenceBridgeID",
                table: "DisputeHearings",
                newName: "NoticeID");

            migrationBuilder.RenameIndex(
                name: "IX_DisputeHearings_NoticeConferenceBridgeID",
                table: "DisputeHearings",
                newName: "IX_DisputeHearings_NoticeID");

            migrationBuilder.AddColumn<DateTime>(
                name: "NoticeHearingStartDateTime",
                table: "DisputeHearings",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_DisputeHearings_Notices_NoticeID",
                table: "DisputeHearings",
                column: "NoticeID",
                principalTable: "Notices",
                principalColumn: "NoticeId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
