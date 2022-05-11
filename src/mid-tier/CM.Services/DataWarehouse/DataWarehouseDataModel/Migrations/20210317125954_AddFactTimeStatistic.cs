using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class AddFactTimeStatistic : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FactTimeStatistics",
                columns: table => new
                {
                    DisputeSummaryRecordId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LoadDateTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AssociatedOffice = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false),
                    StatisticsType = table.Column<byte>(type: "smallint", nullable: false),
                    AssociatedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AssociatedDateId = table.Column<int>(type: "integer", nullable: false),
                    OpenFiles = table.Column<int>(type: "integer", nullable: false),
                    IntakePayments = table.Column<int>(type: "integer", nullable: false),
                    ReviewPayments = table.Column<int>(type: "integer", nullable: false),
                    PerUnitPayments = table.Column<int>(type: "integer", nullable: false),
                    OnlineDisputesPaid = table.Column<int>(type: "integer", nullable: false),
                    OfficeDisputesPaid = table.Column<int>(type: "integer", nullable: false),
                    Process1DisputesPaid = table.Column<int>(type: "integer", nullable: false),
                    Process2DisputesPaid = table.Column<int>(type: "integer", nullable: false),
                    TenantDisputesPaid = table.Column<int>(type: "integer", nullable: false),
                    LandlordDisputesPaid = table.Column<int>(type: "integer", nullable: false),
                    EmergencyDisputesPaid = table.Column<int>(type: "integer", nullable: false),
                    StandardDisputesPaid = table.Column<int>(type: "integer", nullable: false),
                    DeferredDisputesPaid = table.Column<int>(type: "integer", nullable: false),
                    SubServicesSubmitted = table.Column<int>(type: "integer", nullable: false),
                    AmendmentsSubmitted = table.Column<int>(type: "integer", nullable: false),
                    DisputeHearings = table.Column<int>(type: "integer", nullable: false),
                    EmptyHearings = table.Column<int>(type: "integer", nullable: false),
                    AvgNext10EmergHearingDays = table.Column<int>(type: "integer", nullable: false),
                    AvgNext10StandardHearingDays = table.Column<int>(type: "integer", nullable: false),
                    AvgNext10DeferredHearingDays = table.Column<int>(type: "integer", nullable: false),
                    Files = table.Column<int>(type: "integer", nullable: false),
                    FilesMB = table.Column<int>(type: "integer", nullable: false),
                    EvidenceFiles = table.Column<int>(type: "integer", nullable: false),
                    EvidenceFilesMB = table.Column<int>(type: "integer", nullable: false),
                    StatusWaitingProofService = table.Column<int>(type: "integer", nullable: false),
                    StatusAbandonedNeedsUpdate = table.Column<int>(type: "integer", nullable: false),
                    StatusAbandonedNoService = table.Column<int>(type: "integer", nullable: false),
                    StatusCancelled = table.Column<int>(type: "integer", nullable: false),
                    StatusNeedsUpdate = table.Column<int>(type: "integer", nullable: false),
                    StatusWithdrawn = table.Column<int>(type: "integer", nullable: false),
                    StatusWaitingForDecision = table.Column<int>(type: "integer", nullable: false),
                    StatusWaitingForDecisionOldest = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    StatusDecisionsReadyToSend = table.Column<int>(type: "integer", nullable: false),
                    CorrectionRequests = table.Column<int>(type: "integer", nullable: false),
                    ClarificationRequests = table.Column<int>(type: "integer", nullable: false),
                    ReviewRequests = table.Column<int>(type: "integer", nullable: false),
                    StatusClosed = table.Column<int>(type: "integer", nullable: false),
                    Stage0Open = table.Column<int>(type: "integer", nullable: false),
                    Stage2Open = table.Column<int>(type: "integer", nullable: false),
                    Stage4Open = table.Column<int>(type: "integer", nullable: false),
                    Stage6Open = table.Column<int>(type: "integer", nullable: false),
                    Stage8Open = table.Column<int>(type: "integer", nullable: false),
                    Stage10Open = table.Column<int>(type: "integer", nullable: false),
                    Stage2Unassigned = table.Column<int>(type: "integer", nullable: false),
                    Stage2UnassignedOldest = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Stage2Assigned = table.Column<int>(type: "integer", nullable: false),
                    Stage2AssignedOldest = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    StatusRescheduledUnassigned = table.Column<int>(type: "integer", nullable: false),
                    StatusRescheduledAssigned = table.Column<int>(type: "integer", nullable: false),
                    IOIncompleteTasksUnassigned = table.Column<int>(type: "integer", nullable: false),
                    IOIncompleteTasksUnassignedOldest = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    IOIncompleteTasksAssigned = table.Column<int>(type: "integer", nullable: false),
                    IOTasksCompleted = table.Column<int>(type: "integer", nullable: false),
                    ArbIncompleteTasksAssigned = table.Column<int>(type: "integer", nullable: false),
                    ArbIncompleteTasksUnassigned = table.Column<int>(type: "integer", nullable: false),
                    ArbIncompleteTasksUnassignedOldest = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    ArbTasksCompleted = table.Column<int>(type: "integer", nullable: false),
                    OtherIncompleteTasks = table.Column<int>(type: "integer", nullable: false),
                    DocumentsUndelivered = table.Column<int>(type: "integer", nullable: false),
                    DocumentsUndeliveredOldest = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DocumentsUndeliveredUrgent = table.Column<int>(type: "integer", nullable: false),
                    DocumentsUndeliveredUrgentOldest = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DocumentsDelivered = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FactTimeStatistics", x => x.DisputeSummaryRecordId);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FactTimeStatistics");
        }
    }
}
