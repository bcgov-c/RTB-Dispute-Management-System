using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddSubstitutedService : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SubstitutedServices",
                columns: table => new
                {
                    SubstitutedServiceId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true),
                    ServiceByParticipantId = table.Column<int>(nullable: false),
                    ServiceToParticipantId = table.Column<int>(nullable: false),
                    RequestDocType = table.Column<byte>(nullable: true),
                    RequestDocOtherDescription = table.Column<string>(maxLength: 100, nullable: true),
                    FailedMethod1Type = table.Column<byte>(nullable: true),
                    FailedMethod1Description = table.Column<string>(maxLength: 255, nullable: true),
                    FailedMethod1Specifics = table.Column<string>(maxLength: 100, nullable: true),
                    FailedMethod1Date = table.Column<DateTime>(nullable: true),
                    FailedMethod1Note = table.Column<string>(maxLength: 255, nullable: true),
                    FailedMethod1FileDescId = table.Column<int>(nullable: true),
                    FailedMethod2Type = table.Column<byte>(nullable: true),
                    FailedMethod2Description = table.Column<string>(maxLength: 255, nullable: true),
                    FailedMethod2Specifics = table.Column<string>(maxLength: 100, nullable: true),
                    FailedMethod2Date = table.Column<DateTime>(nullable: true),
                    FailedMethod2Note = table.Column<string>(maxLength: 255, nullable: true),
                    FailedMethod2FileDescId = table.Column<int>(nullable: true),
                    FailedMethod3Type = table.Column<byte>(nullable: true),
                    FailedMethod3Description = table.Column<string>(maxLength: 255, nullable: true),
                    FailedMethod3Specifics = table.Column<string>(maxLength: 100, nullable: true),
                    FailedMethod3Date = table.Column<DateTime>(nullable: true),
                    FailedMethod3Note = table.Column<string>(maxLength: 255, nullable: true),
                    FailedMethod3FileDescId = table.Column<int>(nullable: true),
                    OtherFailedMethodDetails = table.Column<string>(maxLength: 255, nullable: true),
                    IsRespondentAvoiding = table.Column<byte>(nullable: true),
                    RespondentAvoidingDetails = table.Column<string>(maxLength: 255, nullable: true),
                    RequestingTimeExtension = table.Column<byte>(nullable: true),
                    RequestingTimeExtensionDate = table.Column<DateTime>(nullable: true),
                    RequestingServiceDirections = table.Column<byte>(nullable: true),
                    RequestedMethodDescription = table.Column<string>(maxLength: 500, nullable: true),
                    RequestedMethodJustification = table.Column<string>(maxLength: 500, nullable: true),
                    RequestMethodFileDescId = table.Column<int>(nullable: true),
                    RequestNotes = table.Column<string>(maxLength: 255, nullable: true),
                    RequestStatus = table.Column<byte>(nullable: true),
                    SubServiceApprovedById = table.Column<int>(nullable: true),
                    SubServiceTitle = table.Column<string>(maxLength: 100, nullable: true),
                    SubServiceInstructions = table.Column<string>(maxLength: 2000, nullable: true),
                    SubServiceEffectiveDate = table.Column<DateTime>(nullable: true),
                    SubServiceExpiryDate = table.Column<DateTime>(nullable: true),
                    SubServiceDocType = table.Column<byte>(nullable: true),
                    SubServiceOtherDescription = table.Column<string>(maxLength: 100, nullable: true),
                    OutcomeDocumentFileId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubstitutedServices", x => x.SubstitutedServiceId);
                    table.ForeignKey(
                        name: "FK_SubstitutedServices_FileDescriptions_FailedMethod1FileDescId",
                        column: x => x.FailedMethod1FileDescId,
                        principalTable: "FileDescriptions",
                        principalColumn: "FileDescriptionId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SubstitutedServices_FileDescriptions_FailedMethod2FileDescId",
                        column: x => x.FailedMethod2FileDescId,
                        principalTable: "FileDescriptions",
                        principalColumn: "FileDescriptionId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SubstitutedServices_FileDescriptions_FailedMethod3FileDescId",
                        column: x => x.FailedMethod3FileDescId,
                        principalTable: "FileDescriptions",
                        principalColumn: "FileDescriptionId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SubstitutedServices_OutcomeDocFiles_OutcomeDocumentFileId",
                        column: x => x.OutcomeDocumentFileId,
                        principalTable: "OutcomeDocFiles",
                        principalColumn: "OutcomeDocFileId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SubstitutedServices_FileDescriptions_RequestMethodFileDescId",
                        column: x => x.RequestMethodFileDescId,
                        principalTable: "FileDescriptions",
                        principalColumn: "FileDescriptionId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SubstitutedServices_Participants_ServiceByParticipantId",
                        column: x => x.ServiceByParticipantId,
                        principalTable: "Participants",
                        principalColumn: "ParticipantId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SubstitutedServices_Participants_ServiceToParticipantId",
                        column: x => x.ServiceToParticipantId,
                        principalTable: "Participants",
                        principalColumn: "ParticipantId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SubstitutedServices_SystemUsers_SubServiceApprovedById",
                        column: x => x.SubServiceApprovedById,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SubstitutedServices_FailedMethod1FileDescId",
                table: "SubstitutedServices",
                column: "FailedMethod1FileDescId");

            migrationBuilder.CreateIndex(
                name: "IX_SubstitutedServices_FailedMethod2FileDescId",
                table: "SubstitutedServices",
                column: "FailedMethod2FileDescId");

            migrationBuilder.CreateIndex(
                name: "IX_SubstitutedServices_FailedMethod3FileDescId",
                table: "SubstitutedServices",
                column: "FailedMethod3FileDescId");

            migrationBuilder.CreateIndex(
                name: "IX_SubstitutedServices_OutcomeDocumentFileId",
                table: "SubstitutedServices",
                column: "OutcomeDocumentFileId");

            migrationBuilder.CreateIndex(
                name: "IX_SubstitutedServices_RequestMethodFileDescId",
                table: "SubstitutedServices",
                column: "RequestMethodFileDescId");

            migrationBuilder.CreateIndex(
                name: "IX_SubstitutedServices_ServiceByParticipantId",
                table: "SubstitutedServices",
                column: "ServiceByParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_SubstitutedServices_ServiceToParticipantId",
                table: "SubstitutedServices",
                column: "ServiceToParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_SubstitutedServices_SubServiceApprovedById",
                table: "SubstitutedServices",
                column: "SubServiceApprovedById");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SubstitutedServices");
        }
    }
}
