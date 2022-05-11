using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class RemovePostedDecisions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PostedDecisionOutcomes");

            migrationBuilder.DropTable(
                name: "PostedDecisions");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PostedDecisions",
                columns: table => new
                {
                    PostedDecisionId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    ApplicantHearingAttendance = table.Column<byte>(type: "smallint", nullable: true),
                    ApplicationSubmittedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    AssociateProcessId = table.Column<byte>(type: "smallint", nullable: true),
                    AssociatedProcessName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CountApplicantEvidenceFiles = table.Column<int>(type: "integer", nullable: true),
                    CountRespondentEvidenceFiles = table.Column<int>(type: "integer", nullable: true),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreatedMethod = table.Column<byte>(type: "smallint", nullable: true),
                    DecisionDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DecisionFileId = table.Column<int>(type: "integer", nullable: false),
                    DisputeId = table.Column<int>(type: "integer", nullable: false),
                    DisputeProcess = table.Column<byte>(type: "smallint", nullable: true),
                    DisputeSubType = table.Column<byte>(type: "smallint", nullable: true),
                    DisputeType = table.Column<byte>(type: "smallint", nullable: true),
                    DisputeUrgency = table.Column<byte>(type: "smallint", nullable: true),
                    FileNumber = table.Column<int>(type: "integer", nullable: false),
                    InitialPaymentMethod = table.Column<byte>(type: "smallint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: true, defaultValue: false),
                    ModifiedBy = table.Column<int>(type: "integer", nullable: true),
                    ModifiedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    NumberAdvocates = table.Column<byte>(type: "smallint", nullable: true),
                    NumberAgents = table.Column<byte>(type: "smallint", nullable: true),
                    NumberApplicants = table.Column<byte>(type: "smallint", nullable: true),
                    NumberBusinesses = table.Column<byte>(type: "smallint", nullable: true),
                    NumberIndividuals = table.Column<byte>(type: "smallint", nullable: true),
                    NumberRespondents = table.Column<byte>(type: "smallint", nullable: true),
                    OriginalNoticeDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    OriginalNoticeDelivered = table.Column<bool>(type: "boolean", nullable: true),
                    PetDamageDepositAmount = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    PostedBy = table.Column<int>(type: "integer", nullable: true),
                    PostingDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    PreviousHearingDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    PreviousHearingLinkingType = table.Column<byte>(type: "smallint", nullable: true),
                    PreviousHearingProcessDuration = table.Column<int>(type: "integer", nullable: true),
                    PreviousHearingProcessMethod = table.Column<byte>(type: "smallint", nullable: true),
                    PrimaryApplicantType = table.Column<byte>(type: "smallint", nullable: true),
                    RentPaymentAmount = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    RentPaymentInterval = table.Column<string>(type: "text", nullable: true),
                    RespondentHearingAttendance = table.Column<byte>(type: "smallint", nullable: true),
                    SearchKeyWords = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    SearchResultSummary = table.Column<string>(type: "character varying(750)", maxLength: 750, nullable: true),
                    SearchTags = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    SearchText = table.Column<string>(type: "text", nullable: true),
                    SecurityDepositAmount = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    TenancyAgreementSignedBy = table.Column<byte>(type: "smallint", nullable: true),
                    TenancyCity = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    TenancyEndDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    TenancyEnded = table.Column<byte>(type: "smallint", nullable: true),
                    TenancyGeozone = table.Column<byte>(type: "smallint", nullable: true),
                    TenancyStartDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PostedDecisions", x => x.PostedDecisionId);
                    table.ForeignKey(
                        name: "FK_PostedDecisions_Files_DecisionFileId",
                        column: x => x.DecisionFileId,
                        principalTable: "Files",
                        principalColumn: "FileId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PostedDecisions_Disputes_DisputeId",
                        column: x => x.DisputeId,
                        principalTable: "Disputes",
                        principalColumn: "DisputeId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PostedDecisions_SystemUsers_PostedBy",
                        column: x => x.PostedBy,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PostedDecisionOutcomes",
                columns: table => new
                {
                    PostedDecisionOutcomeId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    ClaimId = table.Column<int>(type: "integer", nullable: true),
                    ClaimTitle = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: true, defaultValue: false),
                    PostedBy = table.Column<int>(type: "integer", nullable: false),
                    PostedDecisionId = table.Column<int>(type: "integer", nullable: false),
                    PostingDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    RelatedSections = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    RemedyAmountAwarded = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    RemedyAmountRequested = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    RemedyId = table.Column<int>(type: "integer", nullable: true),
                    RemedyStatus = table.Column<byte>(type: "smallint", nullable: false),
                    RemedySubStatus = table.Column<byte>(type: "smallint", nullable: true),
                    RemedyType = table.Column<byte>(type: "smallint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PostedDecisionOutcomes", x => x.PostedDecisionOutcomeId);
                    table.ForeignKey(
                        name: "FK_PostedDecisionOutcomes_Claims_ClaimId",
                        column: x => x.ClaimId,
                        principalTable: "Claims",
                        principalColumn: "ClaimId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PostedDecisionOutcomes_SystemUsers_PostedBy",
                        column: x => x.PostedBy,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PostedDecisionOutcomes_PostedDecisions_PostedDecisionId",
                        column: x => x.PostedDecisionId,
                        principalTable: "PostedDecisions",
                        principalColumn: "PostedDecisionId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PostedDecisionOutcomes_Remedies_RemedyId",
                        column: x => x.RemedyId,
                        principalTable: "Remedies",
                        principalColumn: "RemedyId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PostedDecisionOutcomes_ClaimId",
                table: "PostedDecisionOutcomes",
                column: "ClaimId");

            migrationBuilder.CreateIndex(
                name: "IX_PostedDecisionOutcomes_PostedBy",
                table: "PostedDecisionOutcomes",
                column: "PostedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PostedDecisionOutcomes_PostedDecisionId",
                table: "PostedDecisionOutcomes",
                column: "PostedDecisionId");

            migrationBuilder.CreateIndex(
                name: "IX_PostedDecisionOutcomes_RemedyId",
                table: "PostedDecisionOutcomes",
                column: "RemedyId");

            migrationBuilder.CreateIndex(
                name: "IX_PostedDecisions_DecisionFileId",
                table: "PostedDecisions",
                column: "DecisionFileId");

            migrationBuilder.CreateIndex(
                name: "IX_PostedDecisions_DisputeId",
                table: "PostedDecisions",
                column: "DisputeId");

            migrationBuilder.CreateIndex(
                name: "IX_PostedDecisions_PostedBy",
                table: "PostedDecisions",
                column: "PostedBy");
        }
    }
}
