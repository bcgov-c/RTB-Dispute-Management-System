using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AddAuditLogIndexes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_DisputeGuid",
                table: "AuditLogs",
                column: "DisputeGuid")
                .Annotation("Npgsql:IndexInclude", new[] { "ApiResponse", "ApiCallType" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_DisputeGuid",
                table: "AuditLogs");
        }
    }
}
