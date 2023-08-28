using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class UpdateServiceAuditLogDisputeRelation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ServiceAuditLogs_Disputes_DisputeGuid",
                table: "ServiceAuditLogs");

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceAuditLogs_Disputes_DisputeGuid",
                table: "ServiceAuditLogs",
                column: "DisputeGuid",
                principalTable: "Disputes",
                principalColumn: "DisputeGuid",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ServiceAuditLogs_Disputes_DisputeGuid",
                table: "ServiceAuditLogs");

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceAuditLogs_Disputes_DisputeGuid",
                table: "ServiceAuditLogs",
                column: "DisputeGuid",
                principalTable: "Disputes",
                principalColumn: "DisputeGuid",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
