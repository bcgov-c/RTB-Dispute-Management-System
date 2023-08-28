using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AddDisputeVerificationAttempt : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DisputeVerifications",
                columns: table => new
                {
                    VerificationId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    HearingId = table.Column<int>(type: "integer", nullable: true),
                    DisputeFeeId = table.Column<int>(type: "integer", nullable: true),
                    VerificationType = table.Column<int>(type: "integer", nullable: false),
                    VerificationStatus = table.Column<int>(type: "integer", nullable: true),
                    VerificationStatusDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    VerificationSubStatus = table.Column<byte>(type: "smallint", nullable: true),
                    IsRefundIncluded = table.Column<bool>(type: "boolean", nullable: true),
                    RefundStatus = table.Column<int>(type: "integer", nullable: true),
                    RefundInitiatedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    RefundInitiatedBy = table.Column<int>(type: "integer", nullable: true),
                    RefundNote = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: true, defaultValue: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    ModifiedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DisputeVerifications", x => x.VerificationId);
                    table.ForeignKey(
                        name: "FK_DisputeVerifications_DisputeFees_DisputeFeeId",
                        column: x => x.DisputeFeeId,
                        principalTable: "DisputeFees",
                        principalColumn: "DisputeFeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DisputeVerifications_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DisputeVerifications_Hearings_HearingId",
                        column: x => x.HearingId,
                        principalTable: "Hearings",
                        principalColumn: "HearingId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DisputeVerifications_SystemUsers_RefundInitiatedBy",
                        column: x => x.RefundInitiatedBy,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VerificationAttempts",
                columns: table => new
                {
                    VerificationAttemptId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    ParticipantId = table.Column<int>(type: "integer", nullable: false),
                    ParticipantRole = table.Column<byte>(type: "smallint", nullable: false),
                    AttemptMethod = table.Column<int>(type: "integer", nullable: true),
                    AttemptStartDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    AttemptEndDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    VerificationDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    VerificationOutcome = table.Column<int>(type: "integer", nullable: true),
                    VerificationRefundRequested = table.Column<bool>(type: "boolean", nullable: true),
                    VerificationReason = table.Column<int>(type: "integer", nullable: true),
                    VerificationName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    VerificationAddress = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    VerificationPhone = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: true),
                    VerificationEmail = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    VerificationPaymentDetail = table.Column<string>(type: "text", maxLength: 2147483647, nullable: true),
                    VerificationNote = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: true, defaultValue: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    ModifiedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VerificationAttempts", x => x.VerificationAttemptId);
                    table.ForeignKey(
                        name: "FK_VerificationAttempts_Participants_ParticipantId",
                        column: x => x.ParticipantId,
                        principalTable: "Participants",
                        principalColumn: "ParticipantId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DisputeVerifications_DisputeFeeId",
                table: "DisputeVerifications",
                column: "DisputeFeeId");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeVerifications_DisputeGuid",
                table: "DisputeVerifications",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeVerifications_HearingId",
                table: "DisputeVerifications",
                column: "HearingId");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeVerifications_RefundInitiatedBy",
                table: "DisputeVerifications",
                column: "RefundInitiatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_VerificationAttempts_ParticipantId",
                table: "VerificationAttempts",
                column: "ParticipantId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DisputeVerifications");

            migrationBuilder.DropTable(
                name: "VerificationAttempts");
        }
    }
}
