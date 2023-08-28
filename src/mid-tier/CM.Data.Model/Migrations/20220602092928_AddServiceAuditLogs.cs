using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AddServiceAuditLogs : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ServiceAuditLogs",
                columns: table => new
                {
                    ServiceAuditLogId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceType = table.Column<int>(type: "integer", nullable: false),
                    FilePackageServiceId = table.Column<int>(type: "integer", nullable: true),
                    NoticeServiceId = table.Column<int>(type: "integer", nullable: true),
                    ServiceChangeType = table.Column<int>(type: "integer", nullable: true),
                    ParticipantId = table.Column<int>(type: "integer", nullable: true),
                    OtherParticipantRole = table.Column<byte>(type: "smallint", nullable: true),
                    ProofFileDescriptionId = table.Column<int>(type: "integer", nullable: true),
                    IsServed = table.Column<bool>(type: "boolean", nullable: true),
                    ServiceDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ServiceBy = table.Column<int>(type: "integer", nullable: true),
                    ValidationStatus = table.Column<byte>(type: "smallint", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    ModifiedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceAuditLogs", x => x.ServiceAuditLogId);
                    table.ForeignKey(
                        name: "FK_ServiceAuditLogs_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceAuditLogs_DisputeGuid",
                table: "ServiceAuditLogs",
                column: "DisputeGuid");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServiceAuditLogs");
        }
    }
}
