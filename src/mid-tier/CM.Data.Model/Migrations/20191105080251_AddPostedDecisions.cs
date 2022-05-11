using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddPostedDecisions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PostedDecisions",
                columns: table => new
                {
                    PostedDecisionId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    DisputeId = table.Column<int>(nullable: false),
                    FileNumber = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true, defaultValue: false),
                    DecisionFileId = table.Column<int>(nullable: false),
                    DecisionDate = table.Column<DateTime>(nullable: false),
                    CreatedMethod = table.Column<byte>(nullable: true),
                    InitialPaymentMethod = table.Column<byte>(nullable: true),
                    DisputeType = table.Column<byte>(nullable: true),
                    DisputeSubType = table.Column<byte>(nullable: true),
                    DisputeProcess = table.Column<byte>(nullable: true),
                    DisputeUrgency = table.Column<byte>(nullable: true),
                    TenancyStartDate = table.Column<DateTime>(nullable: true),
                    TenancyEnded = table.Column<bool>(nullable: true),
                    TenancyEndDate = table.Column<DateTime>(nullable: true),
                    TenancyCity = table.Column<string>(maxLength: 50, nullable: true),
                    TenancyGeozone = table.Column<byte>(nullable: true),
                    ApplicationSubmittedDate = table.Column<DateTime>(nullable: true),
                    OriginalNoticeDelivered = table.Column<bool>(nullable: true),
                    OriginalNoticeDate = table.Column<DateTime>(nullable: true),
                    TenancyAgreementSignedBy = table.Column<byte>(nullable: true),
                    RentPaymentAmount = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    RentPaymentInterval = table.Column<byte>(nullable: true),
                    SecurityDepositAmount = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    PetDamageDepositAmount = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
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
                    PostedBy = table.Column<int>(nullable: true)
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

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PostedDecisions");
        }
    }
}
