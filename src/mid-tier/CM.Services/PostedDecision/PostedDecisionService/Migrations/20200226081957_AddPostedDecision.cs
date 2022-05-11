using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Services.PostedDecision.PostedDecisionDataService.Migrations
{
    public partial class AddPostedDecision : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PostedDecisions",
                columns: table => new
                {
                    PostedDecisionId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DisputeId = table.Column<int>(nullable: false),
                    FileNumber = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true),
                    DecisionFileId = table.Column<int>(nullable: false),
                    DecisionDate = table.Column<DateTime>(nullable: false),
                    CreatedMethod = table.Column<byte>(nullable: true),
                    InitialPaymentMethod = table.Column<byte>(nullable: true),
                    DisputeType = table.Column<byte>(nullable: true),
                    DisputeSubType = table.Column<byte>(nullable: true),
                    DisputeProcess = table.Column<byte>(nullable: true),
                    DisputeUrgency = table.Column<byte>(nullable: true),
                    TenancyStartDate = table.Column<DateTime>(nullable: true),
                    TenancyEnded = table.Column<byte>(nullable: true),
                    TenancyEndDate = table.Column<DateTime>(nullable: true),
                    TenancyCity = table.Column<string>(maxLength: 50, nullable: true),
                    TenancyGeozone = table.Column<byte>(nullable: true),
                    ApplicationSubmittedDate = table.Column<DateTime>(nullable: true),
                    OriginalNoticeDelivered = table.Column<bool>(nullable: true),
                    OriginalNoticeDate = table.Column<DateTime>(nullable: true),
                    TenancyAgreementSignedBy = table.Column<byte>(nullable: true),
                    RentPaymentAmount = table.Column<decimal>(nullable: true),
                    RentPaymentInterval = table.Column<string>(nullable: true),
                    SecurityDepositAmount = table.Column<decimal>(nullable: true),
                    PetDamageDepositAmount = table.Column<decimal>(nullable: true),
                    PreviousHearingLinkingType = table.Column<byte>(nullable: true),
                    PreviousHearingDate = table.Column<DateTime>(nullable: true),
                    PreviousHearingProcessDuration = table.Column<int>(nullable: true),
                    PreviousHearingProcessMethod = table.Column<byte>(nullable: true),
                    ApplicantHearingAttendance = table.Column<byte>(nullable: true),
                    RespondentHearingAttendance = table.Column<byte>(nullable: true),
                    AssociateProcessId = table.Column<byte>(nullable: true),
                    AssociatedProcessName = table.Column<string>(maxLength: 100, nullable: true),
                    PrimaryApplicantType = table.Column<byte>(nullable: true),
                    NumberApplicants = table.Column<byte>(nullable: true),
                    NumberRespondents = table.Column<byte>(nullable: true),
                    NumberIndividuals = table.Column<byte>(nullable: true),
                    NumberBusinesses = table.Column<byte>(nullable: true),
                    NumberAgents = table.Column<byte>(nullable: true),
                    NumberAdvocates = table.Column<byte>(nullable: true),
                    CountApplicantEvidenceFiles = table.Column<int>(nullable: true),
                    CountRespondentEvidenceFiles = table.Column<int>(nullable: true),
                    SearchResultSummary = table.Column<string>(maxLength: 750, nullable: true),
                    SearchText = table.Column<string>(nullable: true),
                    SearchTags = table.Column<string>(maxLength: 255, nullable: true),
                    SearchKeyWords = table.Column<string>(maxLength: 255, nullable: true),
                    PostingDate = table.Column<DateTime>(nullable: true),
                    PostedBy = table.Column<int>(nullable: true),
                    NoteWorthy = table.Column<bool>(nullable: true),
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PostedDecisions", x => x.PostedDecisionId);
                });

            migrationBuilder.CreateTable(
                name: "PostedDecisionOutcomes",
                columns: table => new
                {
                    PostedDecisionOutcomeId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PostedDecisionId = table.Column<int>(nullable: false),
                    ClaimId = table.Column<int>(nullable: true),
                    ClaimType = table.Column<byte>(nullable: true),
                    RemedyId = table.Column<int>(nullable: true),
                    RemedyType = table.Column<byte>(nullable: false),
                    RemedyStatus = table.Column<byte>(nullable: false),
                    RemedySubStatus = table.Column<byte>(nullable: true),
                    ClaimTitle = table.Column<string>(maxLength: 255, nullable: true),
                    RelatedSections = table.Column<string>(maxLength: 255, nullable: true),
                    RemedyAmountRequested = table.Column<decimal>(nullable: true),
                    RemedyAmountAwarded = table.Column<decimal>(nullable: true),
                    PostingDate = table.Column<DateTime>(nullable: true),
                    PostedBy = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PostedDecisionOutcomes", x => x.PostedDecisionOutcomeId);
                    table.ForeignKey(
                        name: "FK_PostedDecisionOutcomes_PostedDecisions_PostedDecisionId",
                        column: x => x.PostedDecisionId,
                        principalTable: "PostedDecisions",
                        principalColumn: "PostedDecisionId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PostedDecisionOutcomes_PostedDecisionId",
                table: "PostedDecisionOutcomes",
                column: "PostedDecisionId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PostedDecisionOutcomes");

            migrationBuilder.DropTable(
                name: "PostedDecisions");
        }
    }
}
