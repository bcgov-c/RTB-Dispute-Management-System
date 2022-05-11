using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class AddFactHearingSummary : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FactHearingSummaries",
                columns: table => new
                {
                    HearingSummaryRecordId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LoadDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AssociatedOffice = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false),
                    DisputeGuid = table.Column<Guid>(type: "uuid", nullable: true),
                    HearingId = table.Column<int>(type: "integer", nullable: false),
                    SharedHearingLinkingType = table.Column<byte>(type: "smallint", nullable: true),
                    LinkedDisputes = table.Column<byte>(type: "smallint", nullable: true),
                    SecondaryDisputeGuids = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    LocalHearingStartDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    LocalHearingEndDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    HearingStartDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    HearingEndDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    HearingOwner = table.Column<int>(type: "integer", nullable: true),
                    HearingPriority = table.Column<int>(type: "integer", nullable: true),
                    HearingComplexity = table.Column<int>(type: "integer", nullable: true),
                    HearingDuration = table.Column<int>(type: "integer", nullable: true),
                    HearingPrepTime = table.Column<int>(type: "integer", nullable: true),
                    HearingMethod = table.Column<int>(type: "integer", nullable: true),
                    HearingType = table.Column<int>(type: "integer", nullable: true),
                    HearingParticipations = table.Column<int>(type: "integer", nullable: true),
                    HearingAttendingApplicants = table.Column<int>(type: "integer", nullable: true),
                    HearingAttendingRespondents = table.Column<int>(type: "integer", nullable: true),
                    PrimaryHearings = table.Column<int>(type: "integer", nullable: true),
                    PrimaryAdjourned = table.Column<bool>(type: "boolean", nullable: true),
                    PrimaryPreviousHearingId = table.Column<int>(type: "integer", nullable: true),
                    PrimaryLastProcess = table.Column<int>(type: "integer", nullable: true),
                    PrimaryLastStage = table.Column<int>(type: "integer", nullable: true),
                    PrimaryLastStatus = table.Column<int>(type: "integer", nullable: true),
                    PrimaryDisputeType = table.Column<int>(type: "integer", nullable: true),
                    PrimaryDisputeSubType = table.Column<int>(type: "integer", nullable: true),
                    PrimaryTenancyUnitType = table.Column<int>(type: "integer", nullable: true),
                    PrimaryCreationMethod = table.Column<int>(type: "integer", nullable: true),
                    PrimaryTenancyEnded = table.Column<bool>(type: "boolean", nullable: true),
                    PrimaryTenancyEndDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    PrimaryDisputeUrgency = table.Column<int>(type: "integer", nullable: true),
                    PrimarySubmittedDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    PrimaryInitialPaymentDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    PrimaryParticipants = table.Column<int>(type: "integer", nullable: true),
                    PrimaryApplicants = table.Column<int>(type: "integer", nullable: true),
                    PrimaryRespondents = table.Column<int>(type: "integer", nullable: true),
                    PrimaryTimeSinceInitialPaymentMin = table.Column<int>(type: "integer", nullable: true),
                    PrimaryTimeSinceSubmittedMin = table.Column<int>(type: "integer", nullable: true),
                    PrimaryProcesses = table.Column<int>(type: "integer", nullable: true),
                    PrimaryStatuses = table.Column<int>(type: "integer", nullable: true),
                    PrimarySentEmailMessages = table.Column<int>(type: "integer", nullable: true),
                    PrimaryAmendments = table.Column<int>(type: "integer", nullable: true),
                    PrimarySubServiceRequests = table.Column<int>(type: "integer", nullable: true),
                    PrimaryTotalArbTimeMin = table.Column<int>(type: "integer", nullable: true),
                    PrimaryTotalArbOwners = table.Column<int>(type: "integer", nullable: true),
                    PrimaryTotalStage6TimeMin = table.Column<int>(type: "integer", nullable: true),
                    PrimaryTotalStage8TimeMin = table.Column<int>(type: "integer", nullable: true),
                    AllLinkedEvidenceFiles = table.Column<int>(type: "integer", nullable: true),
                    AllLinkedEvidenceFilesMb = table.Column<decimal>(type: "decimal(8,2)", nullable: true),
                    AllLinkedIssues = table.Column<int>(type: "integer", nullable: true),
                    AllLinkedIssueCodes = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    AllLinkedRequestedAmount = table.Column<int>(type: "integer", nullable: true),
                    PrimarySubmittedTimeId = table.Column<int>(type: "integer", nullable: true),
                    PrimaryInitialPaymentTimeId = table.Column<int>(type: "integer", nullable: true),
                    HearingStartDateTimeId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FactHearingSummaries", x => x.HearingSummaryRecordId);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FactHearingSummaries");
        }
    }
}
