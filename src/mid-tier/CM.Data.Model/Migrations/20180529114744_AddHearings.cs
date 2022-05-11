using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddHearings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_IntakeQuestion_Disputes_DisputeGuid",
                table: "IntakeQuestion");

            migrationBuilder.DropForeignKey(
                name: "FK_Remedy_Claims_ClaimId",
                table: "Remedy");

            migrationBuilder.DropForeignKey(
                name: "FK_RemedyDetail_Participants_DescriptionBy",
                table: "RemedyDetail");

            migrationBuilder.DropForeignKey(
                name: "FK_RemedyDetail_Remedy_RemedyId",
                table: "RemedyDetail");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RemedyDetail",
                table: "RemedyDetail");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Remedy",
                table: "Remedy");

            migrationBuilder.DropPrimaryKey(
                name: "PK_IntakeQuestion",
                table: "IntakeQuestion");

            migrationBuilder.RenameTable(
                name: "RemedyDetail",
                newName: "RemedyDetails");

            migrationBuilder.RenameTable(
                name: "Remedy",
                newName: "Remedies");

            migrationBuilder.RenameTable(
                name: "IntakeQuestion",
                newName: "IntakeQuestions");

            migrationBuilder.RenameIndex(
                name: "IX_RemedyDetail_RemedyId",
                table: "RemedyDetails",
                newName: "IX_RemedyDetails_RemedyId");

            migrationBuilder.RenameIndex(
                name: "IX_RemedyDetail_DescriptionBy",
                table: "RemedyDetails",
                newName: "IX_RemedyDetails_DescriptionBy");

            migrationBuilder.RenameIndex(
                name: "IX_Remedy_ClaimId",
                table: "Remedies",
                newName: "IX_Remedies_ClaimId");

            migrationBuilder.RenameIndex(
                name: "IX_IntakeQuestion_DisputeGuid_QuestionName",
                table: "IntakeQuestions",
                newName: "IX_IntakeQuestions_DisputeGuid_QuestionName");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RemedyDetails",
                table: "RemedyDetails",
                column: "RemedyDetailId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Remedies",
                table: "Remedies",
                column: "RemedyId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_IntakeQuestions",
                table: "IntakeQuestions",
                column: "IntakeQuestionId");

            migrationBuilder.CreateTable(
                name: "Hearings",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    HearingId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeId = table.Column<int>(nullable: true),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    VersionNumber = table.Column<byte>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true),
                    HearingOwner = table.Column<int>(nullable: true),
                    HearingType = table.Column<byte>(nullable: true),
                    HearingMethod = table.Column<byte>(nullable: true),
                    UseCustomSchedule = table.Column<bool>(nullable: true),
                    HearingStart = table.Column<DateTime>(nullable: true),
                    HearingEnd = table.Column<DateTime>(nullable: true),
                    HearingLocation = table.Column<string>(maxLength: 255, nullable: true),
                    PrimaryDialInNumber = table.Column<string>(maxLength: 20, nullable: true),
                    PrimaryDialInTitle = table.Column<string>(maxLength: 100, nullable: true),
                    SecondaryDialInNumber = table.Column<string>(maxLength: 20, nullable: true),
                    SecondaryDialInTitle = table.Column<string>(maxLength: 100, nullable: true),
                    UseSpecialInstructions = table.Column<bool>(nullable: true),
                    SpecialInstructions = table.Column<string>(maxLength: 1500, nullable: true),
                    HearingDetails = table.Column<string>(maxLength: 1500, nullable: true),
                    ParticipantDialCode = table.Column<string>(maxLength: 15, nullable: true),
                    ModeratorDialCode = table.Column<string>(maxLength: 15, nullable: true),
                    HearingComplexity = table.Column<byte>(nullable: true),
                    HearingDuration = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Hearings", x => x.HearingId);
                    table.ForeignKey(
                        name: "FK_Hearings_Disputes_DisputeId",
                        column: x => x.DisputeId,
                        principalTable: "Disputes",
                        principalColumn: "DisputeId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HearingParticipations",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    HearingParticipationId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    HearingId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true),
                    ParticipantId = table.Column<int>(nullable: true),
                    OtherParticipantName = table.Column<string>(maxLength: 255, nullable: true),
                    ParticipationStatus = table.Column<byte>(nullable: true),
                    ParticipationComment = table.Column<string>(maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HearingParticipations", x => x.HearingParticipationId);
                    table.ForeignKey(
                        name: "FK_HearingParticipations_Hearings_HearingId",
                        column: x => x.HearingId,
                        principalTable: "Hearings",
                        principalColumn: "HearingId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HearingParticipations_Participants_ParticipantId",
                        column: x => x.ParticipantId,
                        principalTable: "Participants",
                        principalColumn: "ParticipantId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HearingParticipations_HearingId",
                table: "HearingParticipations",
                column: "HearingId");

            migrationBuilder.CreateIndex(
                name: "IX_HearingParticipations_ParticipantId",
                table: "HearingParticipations",
                column: "ParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_Hearings_DisputeId",
                table: "Hearings",
                column: "DisputeId");

            migrationBuilder.AddForeignKey(
                name: "FK_IntakeQuestions_Disputes_DisputeGuid",
                table: "IntakeQuestions",
                column: "DisputeGuid",
                principalTable: "Disputes",
                principalColumn: "DisputeGuid",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Remedies_Claims_ClaimId",
                table: "Remedies",
                column: "ClaimId",
                principalTable: "Claims",
                principalColumn: "ClaimId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RemedyDetails_Participants_DescriptionBy",
                table: "RemedyDetails",
                column: "DescriptionBy",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RemedyDetails_Remedies_RemedyId",
                table: "RemedyDetails",
                column: "RemedyId",
                principalTable: "Remedies",
                principalColumn: "RemedyId",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_IntakeQuestions_Disputes_DisputeGuid",
                table: "IntakeQuestions");

            migrationBuilder.DropForeignKey(
                name: "FK_Remedies_Claims_ClaimId",
                table: "Remedies");

            migrationBuilder.DropForeignKey(
                name: "FK_RemedyDetails_Participants_DescriptionBy",
                table: "RemedyDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_RemedyDetails_Remedies_RemedyId",
                table: "RemedyDetails");

            migrationBuilder.DropTable(
                name: "HearingParticipations");

            migrationBuilder.DropTable(
                name: "Hearings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RemedyDetails",
                table: "RemedyDetails");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Remedies",
                table: "Remedies");

            migrationBuilder.DropPrimaryKey(
                name: "PK_IntakeQuestions",
                table: "IntakeQuestions");

            migrationBuilder.RenameTable(
                name: "RemedyDetails",
                newName: "RemedyDetail");

            migrationBuilder.RenameTable(
                name: "Remedies",
                newName: "Remedy");

            migrationBuilder.RenameTable(
                name: "IntakeQuestions",
                newName: "IntakeQuestion");

            migrationBuilder.RenameIndex(
                name: "IX_RemedyDetails_RemedyId",
                table: "RemedyDetail",
                newName: "IX_RemedyDetail_RemedyId");

            migrationBuilder.RenameIndex(
                name: "IX_RemedyDetails_DescriptionBy",
                table: "RemedyDetail",
                newName: "IX_RemedyDetail_DescriptionBy");

            migrationBuilder.RenameIndex(
                name: "IX_Remedies_ClaimId",
                table: "Remedy",
                newName: "IX_Remedy_ClaimId");

            migrationBuilder.RenameIndex(
                name: "IX_IntakeQuestions_DisputeGuid_QuestionName",
                table: "IntakeQuestion",
                newName: "IX_IntakeQuestion_DisputeGuid_QuestionName");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RemedyDetail",
                table: "RemedyDetail",
                column: "RemedyDetailId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Remedy",
                table: "Remedy",
                column: "RemedyId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_IntakeQuestion",
                table: "IntakeQuestion",
                column: "IntakeQuestionId");

            migrationBuilder.AddForeignKey(
                name: "FK_IntakeQuestion_Disputes_DisputeGuid",
                table: "IntakeQuestion",
                column: "DisputeGuid",
                principalTable: "Disputes",
                principalColumn: "DisputeGuid",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Remedy_Claims_ClaimId",
                table: "Remedy",
                column: "ClaimId",
                principalTable: "Claims",
                principalColumn: "ClaimId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RemedyDetail_Participants_DescriptionBy",
                table: "RemedyDetail",
                column: "DescriptionBy",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RemedyDetail_Remedy_RemedyId",
                table: "RemedyDetail",
                column: "RemedyId",
                principalTable: "Remedy",
                principalColumn: "RemedyId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
