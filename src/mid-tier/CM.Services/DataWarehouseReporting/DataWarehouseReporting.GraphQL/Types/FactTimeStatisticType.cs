using DataWarehouseReporting.Data.Models;
using GraphQL.Types;

namespace DataWarehouseReporting.GraphQL.Types;

public sealed class FactTimeStatisticType : ObjectGraphType<FactTimeStatistic>
{
    public FactTimeStatisticType()
    {
        Name = "FactTimeStatisticType";
        Description = "FactTimeStatisticType";

        Field(x => x.AmendmentsSubmitted).Description("The total number of amendments applications submitted in last day (24 hours)");
        Field(x => x.ArbIncompleteTasksAssigned).Description("The total number of incomplete Arb tasks assigned  at the time the time the loader ran");
        Field(x => x.ArbIncompleteTasksUnassigned).Description("The total number of incomplete Arb tasks assigned at the time the time the loader ran");
        Field(x => x.ArbIncompleteTasksUnassignedOldest).Description("The date of the oldest incomplete Arb unassigned task (utc) at the time the time the loader ran ");
        Field(x => x.ArbTasksCompleted).Description("The total number of Arb tasks completed in the last day (24 hours)");
        Field(x => x.AssociatedDate).Description("The date that the 24 hour period relates to, e.g. 2021-01-18 ");
        Field(x => x.AssociatedDateId).Description("The ID of the associated date of the data for time grouping");
        Field(x => x.AssociatedOffice).Description("The ID of the office (1=RTB BC - PST)");
        Field(x => x.AvgNext10DeferredHearingDays).Description("The average days until the next 10 deferred hearings are available - after 21 days from now rounded to the nearest whole days");
        Field(x => x.AvgNext10EmergHearingDays).Description("The average days until the next 10 emergency hearings are available - after 8 days from now rounded to the nearest whole days");
        Field(x => x.AvgNext10StandardHearingDays).Description("The average days until the next 10 standard hearings are available - after 21 days from now rounded to the nearest whole days");
        Field(x => x.ClarificationRequests).Description("The count of clarification requests that were submitted in the last day (24 hours)");
        Field(x => x.CorrectionRequests).Description("The count of correction requests that were submitted in the last day (24 hours)");
        Field(x => x.DeferredDisputesPaid).Description("The total number of deferred dispute applications paid in the last day (24 hours). ");
        Field(x => x.DisputeHearings).Description("The total number of hearings with dispute files assigned in the last day (24 hours)");
        Field(x => x.DisputeSummaryRecordId).Description("Auto incrementing primary key");
        Field(x => x.DocumentsDelivered).Description("The total number of documents delivered in the last day (24 hours) - This is not a count of the associated deliveries to specific participants");
        Field(x => x.DocumentsUndelivered).Description("The total number of unique documents that are ready to deliver but not delivered at the time the time the loader ran - This is not a count of the associated deliveries to specific participants");
        Field(x => x.DocumentsUndeliveredOldest).Description("The date of the oldest undelivered urgent document (utc) at the time the time the loader ran ");
        Field(x => x.DocumentsUndeliveredUrgent).Description("The total number of documents undelivered and urgent at the time the time the loader ran");
        Field(x => x.DocumentsUndeliveredUrgentOldest).Description("The date of the oldest undelivered urgent document (utc) at the time the time the loader ran ");
        Field(x => x.EmergencyDisputesPaid).Description("The total number of emergency dispute applications paid in the last day (24 hours)");
        Field(x => x.EmptyHearings).Description("The total number of hearings without dispute files assigned (empty) in the last day (24 hours)");
        Field(x => x.EvidenceFiles).Description("The total number of evidence only files added to system in the last day (24 hours)");
        Field(x => x.EvidenceFilesMb).Description("The total MB of evidence files only added to system in the last day (24 hours)");
        Field(x => x.Files).Description("The total number of total files added to system in the last day (24 hours)");
        Field(x => x.FilesMb).Description("The total MB of files added to system in the last day (24 hours)");
        Field(x => x.IntakePayments).Description("The total number of intake payments in last day (24 hours) PST");
        Field(x => x.IoIncompleteTasksAssigned).Description("The total number of incomplete IO tasks assigned at the time the time the loader ran");
        Field(x => x.IoIncompleteTasksUnassigned).Description("The total number of incomplete IO tasks unassigned at the time the time the loader ran");
        Field(x => x.IoIncompleteTasksUnassignedOldest).Description("The date of the oldest incomplete IO unassigned task (utc) at the time the time the loader ran");
        Field(x => x.IoTasksCompleted).Description("The total number of IO tasks completed in the last day (24 hours)");
        Field(x => x.IsActive).Description("Whether the record is active in the DW (0=No/Inactive, 1=Yes/Active)");
        Field(x => x.IsPublic).Description("Whether the record is public in the DW (0=No/private, 1=Yes/public)");
        Field(x => x.LandlordDisputesPaid).Description("The total number of landlord dispute applications paid in the last day (24 hours)");
        Field(x => x.LoadDateTime).Description("The date/time the record was inserted into the DW");
        Field(x => x.OfficeDisputesPaid).Description("The total number of office dispute applications paid in the last day (24 hours) PST");
        Field(x => x.OnlineDisputesPaid).Description("The total number of online dispute applications paid in the last day(24 hours) PST including ARI - C and PFR");
        Field(x => x.OpenFiles).Description("The total number of open submitted and paid files at the time the time the loader ran ");
        Field(x => x.OtherIncompleteTasks).Description("The total number of incomplete tasks not assigned to arbs or IO at the time the loader ran");
        Field(x => x.PerUnitPayments).Description("The total number of ARI-C / PFR / ARI-E per unit based payments in the last day (24 hours) PST");
        Field(x => x.Process1DisputesPaid).Description("The total number of process 1 (participatory) disputes paid in the last day (24 hours) PST");
        Field(x => x.Process2DisputesPaid).Description("The total number of process 2 (non-participatory) disputes paid in the last day (24 hours) PST");
        Field(x => x.ReviewPayments).Description("The total number of review payments in the last day (24 hours) PST");
        Field(x => x.ReviewRequests).Description("The count of review requests that were submitted in the last day (24 hours)");
        Field(x => x.Stage0Open).Description("The total number of stage 0 that are submitted and are waiting update or payment at the time the time the loader ran");
        Field(x => x.Stage10Open).Description("The total number of stage 10 open at the time the time the loader ran");
        Field(x => x.Stage2Assigned).Description("The total number of stage 2 assigned files at the time the time the loader ran ");
        Field(x => x.Stage2AssignedOldest).Description("The date of the oldest Stage 2 assigned file (utc) at the time the time the loader ran ");
        Field(x => x.Stage2Open).Description("The total number of stage 2 open at the time the time the loader ran ");
        Field(x => x.Stage2Unassigned).Description("The total number of stage unassigned at the time the time the loader ran ");
        Field(x => x.Stage2UnassignedOldest).Description("The date of the oldest Stage 2 unassigned file (utc), at the time the time the loader ran ");
        Field(x => x.Stage4Open).Description("The total number of stage 4 open at the time the time the loader ran ");
        Field(x => x.Stage6Open).Description("The total number of stage 6 open at the time the time the loader ran ");
        Field(x => x.Stage8Open).Description("The total number of stage 8 open at the time the time the loader ran");
        Field(x => x.StandardDisputesPaid).Description("The total number of standard dispute applications paid in the last day (24 hours)");
        Field(x => x.StatisticsType).Description("Used to record what type of statistics is being loaded - initally will just be 1 (daily), but may be expanded to include 2=weekly, 3=monthly, 4=yearly, etc");
        Field(x => x.StatusAbandonedNeedsUpdate).Description("The total number of disputes set to a final status of abandoned for client inaction after needs update (0:1 or 0:6) in the last day (24 hours)");
        Field(x => x.StatusAbandonedNoService).Description("The total number of disputes set to a final status of abandoned for client inaction after no service in the last day (24 hours)");
        Field(x => x.StatusCancelled).Description("The total number of disputes set to a final status cancelled in the last day (24 hours)");
        Field(x => x.StatusClosed).Description("The total number of status closed at the time the time the loader ran");
        Field(x => x.StatusNeedsUpdate).Description("The total number of unique disputes with a status set to needs update or incomplete paper application in the last day (24 hours)");
        Field(x => x.StatusRescheduledAssigned).Description("The total number of status rescheduled assigned at the time the time the loader ran");
        Field(x => x.StatusRescheduledUnassigned).Description("The total number of status set to rescheduled at the time the time the loader ran");
        Field(x => x.StatusWaitingForDecision).Description("The total number of status waiting for arb decision at the time the time the loader ran");
        Field(x => x.StatusWaitingForDecisionOldest).Description("The date of the oldest file that is waiting for a decision (utc) at the time the time the loader ran ");
        Field(x => x.StatusWaitingProofService).Description("The total number of status waiting proof service at the time the time the loader ran");
        Field(x => x.StatusWithdrawn).Description("The total number of disputes set to a final status of withdrawn in the last day (24 hours)");
        Field(x => x.SubServicesSubmitted).Description("The total number of substituted service applications submitted in last day (24 hours)");
        Field(x => x.TenantDisputesPaid).Description("The total number of tenant disputes applications paid in the last day (24 hours)");
    }
}