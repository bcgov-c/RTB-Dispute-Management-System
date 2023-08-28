using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class AddFactResolutionServices : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FactResolutionServices",
                columns: table => new
                {
                    ResolutionServiceRecordId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LoadDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AssociatedOffice = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false),
                    DisputeGuid = table.Column<Guid>(type: "uuid", nullable: true),
                    OutcomeDocGroupId = table.Column<int>(type: "integer", nullable: true),
                    DocGroupCreatedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DocGroupCreatedById = table.Column<int>(type: "integer", nullable: true),
                    DocStatus = table.Column<int>(type: "integer", nullable: true),
                    DocStatusDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DerivedDocumentType = table.Column<int>(type: "integer", nullable: true),
                    TotalDocuments = table.Column<int>(type: "integer", nullable: true),
                    DocumentFileTypes = table.Column<string>(type: "character varying(75)", maxLength: 75, nullable: true),
                    ContainsVisibleToPublic = table.Column<bool>(type: "boolean", nullable: true),
                    ContainsMateriallyDifferent = table.Column<bool>(type: "boolean", nullable: true),
                    ContainsNoteworthy = table.Column<bool>(type: "boolean", nullable: true),
                    AssociatedToPriorHearing = table.Column<bool>(type: "boolean", nullable: true),
                    PriorHearingId = table.Column<int>(type: "integer", nullable: true),
                    PriorSharedHearingLinkingType = table.Column<int>(type: "integer", nullable: true),
                    PriorLinkedDisputes = table.Column<int>(type: "integer", nullable: true),
                    PriorHearingDuration = table.Column<int>(type: "integer", nullable: true),
                    PriorHearingComplexity = table.Column<int>(type: "integer", nullable: true),
                    ContainsReviewReplacement = table.Column<bool>(type: "boolean", nullable: true),
                    ContainsCorrectionReplacement = table.Column<bool>(type: "boolean", nullable: true),
                    TotalDocumentsDelivered = table.Column<int>(type: "integer", nullable: true),
                    DocumentsDeliveredMail = table.Column<int>(type: "integer", nullable: true),
                    DocumentsDeliveredEmail = table.Column<int>(type: "integer", nullable: true),
                    DocumentsDeliveredPickup = table.Column<int>(type: "integer", nullable: true),
                    DocumentsDeliveredOther = table.Column<int>(type: "integer", nullable: true),
                    LatestReadyForDeliveryDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    LatestDeliveryDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DeliveryPriority = table.Column<int>(type: "integer", nullable: true),
                    DocPreparationTime = table.Column<int>(type: "integer", nullable: true),
                    DocWritingTime = table.Column<int>(type: "integer", nullable: true),
                    DocComplexity = table.Column<int>(type: "integer", nullable: true),
                    DocCompletedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Applicants = table.Column<int>(type: "integer", nullable: true),
                    Respondents = table.Column<int>(type: "integer", nullable: true),
                    Issues = table.Column<int>(type: "integer", nullable: true),
                    DisputeUrgency = table.Column<int>(type: "integer", nullable: true),
                    DisputeCreationMethod = table.Column<int>(type: "integer", nullable: true),
                    LastStage = table.Column<int>(type: "integer", nullable: true),
                    LastStatus = table.Column<int>(type: "integer", nullable: true),
                    LastProcess = table.Column<int>(type: "integer", nullable: true),
                    LastStatusDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DisputeType = table.Column<int>(type: "integer", nullable: true),
                    DisputeSubType = table.Column<int>(type: "integer", nullable: true),
                    CreationMethod = table.Column<int>(type: "integer", nullable: true),
                    SubmittedDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    InitialPaymentDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    EvidenceFiles = table.Column<int>(type: "integer", nullable: true),
                    EvidenceFilesMb = table.Column<decimal>(type: "numeric", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FactResolutionServices", x => x.ResolutionServiceRecordId);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FactResolutionServices");
        }
    }
}
