using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddAuditLogsAmendmentsAndExcludedWords : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AccessCodeExcludeWords",
                columns: table => new
                {
                    ExcludeWordId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    ExcludeWord = table.Column<string>(maxLength: 6, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccessCodeExcludeWords", x => x.ExcludeWordId);
                });

            migrationBuilder.CreateTable(
                name: "Amendments",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    AmendmentId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    AmendmentTitle = table.Column<string>(maxLength: 70, nullable: false),
                    AmendmentTo = table.Column<byte>(nullable: false),
                    AmendmentChangeType = table.Column<byte>(nullable: false),
                    AmendmentChangeHtml = table.Column<string>(nullable: false),
                    AmendmentSubmitterId = table.Column<int>(nullable: true),
                    AmendmentPendingData = table.Column<string>(nullable: true),
                    AmendmentStatus = table.Column<byte>(nullable: false),
                    AmendmentDescription = table.Column<string>(maxLength: 255, nullable: true),
                    AmendmentFileId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Amendments", x => x.AmendmentId);
                    table.ForeignKey(
                        name: "FK_Amendments_Participants_AmendmentSubmitterId",
                        column: x => x.AmendmentSubmitterId,
                        principalTable: "Participants",
                        principalColumn: "ParticipantId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Amendments_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    AuditLogId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeGuid = table.Column<Guid>(nullable: true),
                    ApiCallType = table.Column<string>(maxLength: 10, nullable: false),
                    ApiName = table.Column<string>(maxLength: 100, nullable: false),
                    ApiCallData = table.Column<string>(nullable: false),
                    ApiResponse = table.Column<string>(maxLength: 10, nullable: true),
                    ApiErrorResponse = table.Column<string>(nullable: true),
                    ChangeDate = table.Column<DateTime>(nullable: false),
                    SubmittedBy = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.AuditLogId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Amendments_AmendmentSubmitterId",
                table: "Amendments",
                column: "AmendmentSubmitterId");

            migrationBuilder.CreateIndex(
                name: "IX_Amendments_DisputeGuid",
                table: "Amendments",
                column: "DisputeGuid");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccessCodeExcludeWords");

            migrationBuilder.DropTable(
                name: "Amendments");

            migrationBuilder.DropTable(
                name: "AuditLogs");
        }
    }
}
