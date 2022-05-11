using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddHearingAuditLogs : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HearingAuditLogs",
                columns: table => new
                {
                    HearingAuditLogId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    HearingChangeType = table.Column<int>(nullable: false),
                    HearingId = table.Column<int>(nullable: false),
                    HearingType = table.Column<byte>(nullable: true),
                    HearingSubType = table.Column<byte>(nullable: true),
                    HearingPriority = table.Column<byte>(nullable: true),
                    ConferenceBridgeId = table.Column<int>(nullable: true),
                    HearingOwner = table.Column<int>(nullable: false),
                    HearingStartDateTime = table.Column<DateTime>(nullable: true),
                    HearingEndDateTime = table.Column<DateTime>(nullable: true),
                    LocalStartDateTime = table.Column<DateTime>(nullable: true),
                    LocalEndDateTime = table.Column<DateTime>(nullable: true),
                    DisputeHearingRole = table.Column<byte>(nullable: false),
                    DisputeGuid = table.Column<Guid>(nullable: true),
                    SharedHearingLinkType = table.Column<byte>(nullable: true),
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HearingAuditLogs", x => x.HearingAuditLogId);
                    table.ForeignKey(
                        name: "FK_HearingAuditLogs_ConferenceBridges_ConferenceBridgeId",
                        column: x => x.ConferenceBridgeId,
                        principalTable: "ConferenceBridges",
                        principalColumn: "ConferenceBridgeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HearingAuditLogs_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HearingAuditLogs_Hearings_HearingId",
                        column: x => x.HearingId,
                        principalTable: "Hearings",
                        principalColumn: "HearingId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HearingAuditLogs_SystemUsers_HearingOwner",
                        column: x => x.HearingOwner,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HearingAuditLogs_ConferenceBridgeId",
                table: "HearingAuditLogs",
                column: "ConferenceBridgeId");

            migrationBuilder.CreateIndex(
                name: "IX_HearingAuditLogs_DisputeGuid",
                table: "HearingAuditLogs",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_HearingAuditLogs_HearingId",
                table: "HearingAuditLogs",
                column: "HearingId");

            migrationBuilder.CreateIndex(
                name: "IX_HearingAuditLogs_HearingOwner",
                table: "HearingAuditLogs",
                column: "HearingOwner");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HearingAuditLogs");
        }
    }
}
