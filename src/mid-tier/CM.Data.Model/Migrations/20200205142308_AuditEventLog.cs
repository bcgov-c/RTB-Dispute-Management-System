using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AuditEventLog : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditEventLogs",
                columns: table => new
                {
                    AuditEventLogId = table.Column<long>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    UserId = table.Column<int>(nullable: true),
                    DisputeGuid = table.Column<Guid>(nullable: true),
                    EventType = table.Column<string>(nullable: true),
                    EntityName = table.Column<string>(nullable: true),
                    TableName = table.Column<string>(nullable: true),
                    DateTime = table.Column<DateTime>(nullable: false),
                    KeyValues = table.Column<string>(nullable: true),
                    OldValues = table.Column<string>(nullable: true),
                    NewValues = table.Column<string>(nullable: true)
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

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditEventLogs");
        }
    }
}
