using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateDisputeLastModified : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CaseFileLastModifiedDate",
                table: "Disputes");

            migrationBuilder.CreateIndex(
                name: "IX_DisputesLastModified_DisputeGuid",
                table: "DisputesLastModified",
                column: "DisputeGuid",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_DisputesLastModified_Disputes_DisputeGuid",
                table: "DisputesLastModified",
                column: "DisputeGuid",
                principalTable: "Disputes",
                principalColumn: "DisputeGuid",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DisputesLastModified_Disputes_DisputeGuid",
                table: "DisputesLastModified");

            migrationBuilder.DropIndex(
                name: "IX_DisputesLastModified_DisputeGuid",
                table: "DisputesLastModified");

            migrationBuilder.AddColumn<DateTime>(
                name: "CaseFileLastModifiedDate",
                table: "Disputes",
                type: "timestamp without time zone",
                nullable: true);
        }
    }
}
