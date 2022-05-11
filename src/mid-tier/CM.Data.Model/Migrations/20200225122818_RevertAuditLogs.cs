using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class RevertAuditLogs : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditEventLogs");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditEventLogs",
                columns: table => new
                {
                    AuditEventLogId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DisputeGuid = table.Column<Guid>(type: "uuid", nullable: true),
                    EntityName = table.Column<string>(type: "text", nullable: true),
                    EventType = table.Column<string>(type: "text", nullable: true),
                    KeyValues = table.Column<string>(type: "text", nullable: true),
                    NewValues = table.Column<string>(type: "text", nullable: true),
                    OldValues = table.Column<string>(type: "text", nullable: true),
                    TableName = table.Column<string>(type: "text", nullable: true),
                    UserId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditEventLogs", x => x.AuditEventLogId);
                    table.ForeignKey(
                        name: "FK_AuditEventLogs_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AuditEventLogs_SystemUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuditEventLogs_DisputeGuid",
                table: "AuditEventLogs",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_AuditEventLogs_UserId",
                table: "AuditEventLogs",
                column: "UserId");
        }
    }
}
