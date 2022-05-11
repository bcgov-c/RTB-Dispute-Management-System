using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateDisputeHearings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "HearingLocalStartDateTime",
                table: "DisputeHearings",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NoticeID",
                table: "DisputeHearings",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_DisputeHearings_NoticeID",
                table: "DisputeHearings",
                column: "NoticeID");

            migrationBuilder.AddForeignKey(
                name: "FK_DisputeHearings_Notices_NoticeID",
                table: "DisputeHearings",
                column: "NoticeID",
                principalTable: "Notices",
                principalColumn: "NoticeId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DisputeHearings_Notices_NoticeID",
                table: "DisputeHearings");

            migrationBuilder.DropIndex(
                name: "IX_DisputeHearings_NoticeID",
                table: "DisputeHearings");

            migrationBuilder.DropColumn(
                name: "HearingLocalStartDateTime",
                table: "DisputeHearings");

            migrationBuilder.DropColumn(
                name: "NoticeID",
                table: "DisputeHearings");
        }
    }
}
