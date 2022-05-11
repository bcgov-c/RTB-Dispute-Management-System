using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class RemoveDisputeAndHearingRelation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Hearings_Disputes_DisputeGuid",
                table: "Hearings");

            migrationBuilder.DropIndex(
                name: "IX_Hearings_DisputeGuid",
                table: "Hearings");

            migrationBuilder.DropColumn(
                name: "DisputeGuid",
                table: "Hearings");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DisputeGuid",
                table: "Hearings",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Hearings_DisputeGuid",
                table: "Hearings",
                column: "DisputeGuid");

            migrationBuilder.AddForeignKey(
                name: "FK_Hearings_Disputes_DisputeGuid",
                table: "Hearings",
                column: "DisputeGuid",
                principalTable: "Disputes",
                principalColumn: "DisputeGuid",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
