using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class AddFactIntakeProcessings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FactIntakeProcessings",
                columns: table => new
                {
                    IntakeProcessingRecordId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LoadDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AssociatedOffice = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false),
                    DisputeGuid = table.Column<Guid>(type: "uuid", nullable: true),
                    ProcessStartDisputeStatusId = table.Column<int>(type: "integer", nullable: true),
                    ProcessStartDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ProcessStartProcess = table.Column<int>(type: "integer", nullable: true),
                    ProcessEndDisputeStatusId = table.Column<int>(type: "integer", nullable: true),
                    ProcessEndDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ProcessEndStage = table.Column<int>(type: "integer", nullable: true),
                    ProcessEndStatus = table.Column<int>(type: "integer", nullable: true),
                    ProcessEndProcess = table.Column<int>(type: "integer", nullable: true),
                    UnassignedStage2TimeMin = table.Column<int>(type: "integer", nullable: true),
                    TimeIOAssignedMin = table.Column<int>(type: "integer", nullable: true),
                    TimeTotalProcessingMin = table.Column<int>(type: "integer", nullable: true),
                    ConfirmingInfoStatusTimeMin = table.Column<int>(type: "integer", nullable: true),
                    ProcessDecReqStatusTimeMin = table.Column<int>(type: "integer", nullable: true),
                    ProcessDecReqStatusAssignedTimeMin = table.Column<int>(type: "integer", nullable: true),
                    ScreenDecReqStatusTimeMin = table.Column<int>(type: "integer", nullable: true),
                    ScreenDecReqStatusAssignedTimeMin = table.Column<int>(type: "integer", nullable: true),
                    FirstAssignedDisputeStatusId = table.Column<int>(type: "integer", nullable: true),
                    FirstAssignedDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    FirstAssignedStatus = table.Column<int>(type: "integer", nullable: true),
                    FirstAssignedOwner = table.Column<int>(type: "integer", nullable: true),
                    LastAssignedDisputeStatusId = table.Column<int>(type: "integer", nullable: true),
                    LastAssignedDateTime = table.Column<int>(type: "integer", nullable: true),
                    LastAssignedStatus = table.Column<int>(type: "integer", nullable: true),
                    LastAssignedOwner = table.Column<int>(type: "integer", nullable: true),
                    ProcessingOwners = table.Column<int>(type: "integer", nullable: true),
                    ProcessingOwnersList = table.Column<string>(type: "character varying(75)", maxLength: 75, nullable: true),
                    IntakeWasUpdated = table.Column<bool>(type: "boolean", nullable: true),
                    TimeStatusNeedsUpdateMin = table.Column<int>(type: "integer", nullable: true),
                    DisputeType = table.Column<int>(type: "integer", nullable: true),
                    DisputeSubType = table.Column<int>(type: "integer", nullable: true),
                    TenancyUnitType = table.Column<int>(type: "integer", nullable: true),
                    DisputeUrgency = table.Column<int>(type: "integer", nullable: true),
                    CreationMethod = table.Column<int>(type: "integer", nullable: true),
                    TenancyEnded = table.Column<bool>(type: "boolean", nullable: true),
                    TenancyEndDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    SubmittedDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    InitialPaymentMethod = table.Column<int>(type: "integer", nullable: true),
                    InitialPaymentDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    SharedHearingLinkingType = table.Column<int>(type: "integer", nullable: true),
                    DisputeHearingRole = table.Column<int>(type: "integer", nullable: true),
                    LinkedDisputes = table.Column<int>(type: "integer", nullable: true),
                    HearingStartDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Participants = table.Column<int>(type: "integer", nullable: true),
                    Applicants = table.Column<int>(type: "integer", nullable: true),
                    Respondents = table.Column<int>(type: "integer", nullable: true),
                    Issues = table.Column<int>(type: "integer", nullable: true),
                    Processes = table.Column<int>(type: "integer", nullable: true),
                    Statuses = table.Column<int>(type: "integer", nullable: true),
                    EvidenceFiles = table.Column<int>(type: "integer", nullable: true),
                    EvidenceFilesMb = table.Column<int>(type: "integer", nullable: true),
                    SubServiceRequests = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FactIntakeProcessings", x => x.IntakeProcessingRecordId);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FactIntakeProcessings");
        }
    }
}
