using CM.Common.Utilities;
using DataWarehouseReporting.Data.Models;
using GraphQL.Types;

namespace DataWarehouseReporting.GraphQL.Types;

public sealed class FactDisputeSummaryType : ObjectGraphType<FactDisputeSummary>
{
    public FactDisputeSummaryType()
    {
        Name = "FactDisputeSummaryType";
        Description = "FactDisputeSummaryType";

        Field(x => x.Amendments).Description("The total number of amendments notices generated on the dispute");
        Field(x => x.Applicants).Description("The total active applicants on the dispute");
        Field(x => x.Hearings).Description("The total number of hearings on the dispute");
        Field(x => x.Issues).Description("The total count of active claims on the dispute (not deleted or removed through amendment prior to hearing)");
        Field(x => x.Notes).Description("The total number of notes recorded on the dispute");
        Field(x => x.Notices).Description("The total number of notices on the dispute");
        Field(x => x.Participants).Description("The total active participants on the dispute");
        Field(x => x.Payments).Description("The number of payments on the dispute file (count of active dispute fees)");
        Field(x => x.Processes).Description("The total count of processes on the dispute");
        Field(x => x.Respondents).Description("The total active respondents on the dispute");
        Field(x => x.Statuses).Description("The total statuses on the dispute - not including changes to owner and evidence override enable/disable");
        Field(x => x.Tasks).Description("The total number of tasks recorded on the dispute");
        Field(x => x.Transactions).Description("The total number of transactions on the dispute associated to active dispute fees");
        Field(x => x.AssociatedOffice).Description("The ID of the office (1=RTB BC)");
        Field(x => x.AwardedAmount).Description("The total amount awarded on monetary issues");
        Field(x => x.AwardedIssues).Description("The total count of awarded issues on the dispute (not dismissed, severed, not awarded)");
        Field(x => x.AwardedPossessions).Description("The total number of awarded orders of possession");
        Field(x => x.CreationMethod, true).Description("The creation method for grouping ( 1=online, 2=manual/paper, 3=Legacy service portal)");
        Field(x => x.CrossHearings).Description("The total number of crossed hearings");
        Field(x => x.DisputeType, true).Description("The type of the dispute for grouping  1=RTA, 2=MHPTA");
        Field(x => x.DisputeUrgency, true).Description("The urgency for grouping (1=Emergency, 2=Regular, 3=Deferred)");
        Field(x => x.DocumentsDelivered).Description("The number of documents delivered ");
        Field(x => x.EvidenceFiles).Description("The total evidence files on the dispute regardless of whether the participant or associated issues were removed by amendment or arbitrator actions.");
        Field(x => x.EvidenceOverrides).Description("The total number of evidence overrides on the dispute");
        Field(x => x.EvidencePackages).Description("The total evidence packages on the dispute");
        Field(x => x.DisputeGuid).Description("The unique guid of the associated dispute in DMS");
        Field(x => x.HearingParticipations).Description("The total number of records where hearings were set to participated");
        Field(x => x.IsActive).Description("Whether the record is active in the DW (0=No/Inactive, 1=Yes/Active)");
        Field(x => x.IsPublic).Description("Whether the record is public in the DW (0=No/private, 1=Yes/public)");
        Field(x => x.LastProcess, true).Description("The ID of the last process for grouping (1-7, see PSSO)");
        Field(x => x.LastStage, true).Description("The ID of the last stage for grouping  (see PSSO)");
        Field(x => x.LastStatus).Description("The ID of the last status for grouping (see PSSO)");
        Field(x => x.NoticeServices).Description("The total number of notices where service was indicated as served");
        Field(x => x.PaymentsAmount).Description("The total amount of payments made on the dispute");
        Field(x => x.AccessCodeUsers).Description("The total users that have used an access code on the dispute");
        Field(x => x.DecisionsAndOrders).Description("The total number of decisions and orders on the dispute (PDF)");
        Field(x => x.DisputeSubType).Description("The subtype of the dispute for grouping 0=Applicant is Landlord, 1= Applicant is Tenant");
        Field(x => x.EvidenceFilesMb).Description("The total MB of evidence files on the dispute");
        Field(x => x.EvidencePackageServices).Description("The total number of evidence package services where it was indicated as served");
        Field(x => x.InitialPaymentMethod, true).Description("The method that was used to make the initial application payment");
        Field(x => x.LoadDateTime).Description("The date/time the record was inserted into the DW");
        Field(x => x.PaymentTimeId, true).Description("The ID of the associated time it was paid for time grouping");
        Field(x => x.SentEmailMessages).Description("The total number of email messages sent from the dispute");
        Field(x => x.SubmittedDateTime, true).Description("The exact date-time it was submitted");
        Field(x => x.SubmittedTimeId, true).Description("The ID of the associated time it was submitted for time grouping");
        Field(x => x.SubServiceRequests).Description("The total number of substitute service requests on the dispute");
        Field(x => x.DecisionsAndOrdersMb).Description("The total MB of decsions and orders on the dispute");
        Field(x => x.DisputeSummaryRecordId).Description("Auto incrementing primary key");
        Field(x => x.InitialPaymentDateTime, true).Description("The exact date-time the initial payment was made");
        Field(x => x.LastStatusDateTime).Description("The exact date-time of the last status change");
        Field(x => x.LastStatusTimeId, true).Description("The ID of the assocaited last status time (likely when it was closed) for time grouping");
        Field(x => x.MigrationSourceOfTruth, true).Description("The migration source of truth for grouping (1=DMS, 2=CMS Archive Viewer, 3=Split) for grouping");
        Field(x => x.NoticeDeliveredDateTime, true).Description("The exact date-time initial notice was delivered to the applicant");
        Field(x => x.NoticeDeliveredTimeId, true).Description("The ID of the associated time first notice was delivered to the primary applicant for time grouping");
        Field(x => x.TotalArbTimeMin).Description("The total time of Arb status time in the dispute in minutes");
        Field(x => x.TotalIoTimeMin).Description("The total time of IO status time in the dispute in minutes");
        Field(x => x.TotalOpenTimeMin).Description("The total time in minutes for all open stages and statuses after the dispute was submitted/paid");
        Field(x => x.AvgTaskOpenTimeMin).Description("The average time that completed tasks on the dispute file took to complete");
        Field(x => x.LastParticipatoryHearingDateTime, true).Description("The exact date-time of the last participatory hearing");
        Field(x => x.LastParticipatoryHearingTimeId, true).Description("The ID of the associated time the last participatory hearing was held on the dispute");
        Field(x => x.TotalCitizenStatusTimeMin).Description("The total amount of citizen status time in the dispute in minutes");
        Field(x => x.CreatedDate).Description("The date that the dispute file was initially created");
        Field(x => x.TenancyEnded, true).Description("Whether or not the tenancy had ended");
        Field(x => x.AwardedMonetaryIssues).Description("the total count of awarded issues on the dispute that have a positive ");
        Field(x => x.RequestedAmount).Description("The total amount of monetary remuneration requested by the applicant for active claims.");
        Field(x => x.EvidenceFilesFromApplicant).Description("The total number of evidence files on the dispute that are associated to applicants regardless if they have removed by amendment or staff/arbitrator actions - does not include tenancy agreements or monetary order worksheets");
        Field(x => x.EvidenceFilesFromRespondent).Description("The total number of evidence files on the dispute that are associated to respondents regardless if they have removed by amendment or staff/arbitrator actions - does not include tenancy agreements or monetary order worksheets");
        Field(x => x.EvidencePackagesFromApplicant).Description("The total evidence packages that were submitted by applicants regardless if they have removed by amendment or staff/arbitrator actions - does not include tenancy agreements or monetary order worksheets");
        Field(x => x.EvidencePackagesFromRespondent).Description("The total evidence packages that were submitted by respondents regardless if they have removed by amendment or staff/arbitrator actions - does not include tenancy agreements or monetary order worksheets");
        Field(x => x.EvidenceFilesMbFromApplicant).Description("The total MB of applicant evidence files on the dispute regardless if they have removed by amendment or staff/arbitrator actions - does not include tenancy agreements or monetary order worksheets");
        Field(x => x.EvidenceFilesMbFromRespondent).Description("The total MB of respondent evidence files on the dispute regardless if they have removed by amendment or staff/arbitrator actions - does not include tenancy agreements or monetary order worksheets");
        Field(x => x.DocumentSets).Description("The total number of unique document sets that contain documents");
        Field(x => x.OrdersMonetary).Description("The total number of monetary orders on the dispute (PDF)");
        Field(x => x.OrdersPossession).Description("The total number of possession orders on the dispute (PDF)");
        Field(x => x.DecisionsInterim).Description("The total number of interim decisions on the dispute (PDF)");
        Field(x => x.TotalIoOwners).Description("The total number of distinct owners on the file that have an internal user role of 1 / IO");
        Field(x => x.TotalArbOwners).Description("The total number of distinct owners on the file that have an internal user role of 2 / arb");
        Field(x => x.TotalStage0TimeMin).Description("The total time in Stage 0 - Application in progress");
        Field(x => x.TotalStage2TimeMin).Description("The total time in Stage 2 - Application Screening");
        Field(x => x.TotalStage4TimeMin).Description("The total time in Stage 4 - Serving Documents");
        Field(x => x.TotalStage6TimeMin).Description("The total time in Stage 6 - Hearing Pending");
        Field(x => x.TotalStage8TimeMin).Description("The total time in Stage 8 - Hearing");
        Field(x => x.TotalStage10TimeMin).Description("The total time in Stage 10 - Decision and Post Support");
        Field(x => x.TotalStatus22TimeMin).Description("The total time in Status 22 Confirming Information");
        Field(x => x.TotalStatus41TimeMin).Description("The total time in Status 41 - Waiting proof of service");
        Field(x => x.TotalStatus102TimeMin).Description("The total time in Status 102 - Decisions ready to send");
        Field(x => x.TotalHearingTimeMin).Description("The sum of all arbitrator recorded hearing time associated to the hearings associated to the dispute");
        Field(x => x.TotalHearingPrepTimeMin).Description("The sum of all arbitrator recorded hearing prep time associated to the hearings associated to the dispute");
        Field(x => x.TotalWritingTimeMin).Description("A sum of all process outcome writing time associated to the dispute file");
        Field(x => x.IsAdjourned).Description("Whether or not the dispute file was ever recorded as adjourned (status 63)");
        Field(x => x.AmendRemovedParticipants).Description("The total number of participants that were removed through amendment prior to the hearing");
        Field(x => x.AmendRemovedIssues).Description("The total count of issues that were removed from the dispute file after notice was generated through amendment prior to the hearing");
        Field(x => x.TenancyEndDate, true).Description("Actual date that the time is ended (could be null)");
        Field(x => x.TenancyUnitType, true).Description("The unique identifier for shared addresses (1=basement, 2=upper, 3=lower, 4=main, 5=coach house, 6=laneway, 7=other)");
        Field(x => x.RequestedReviewConsideration, true).Description("The number of review consideration request were submitted to this dispute.");
        Field(x => x.AwardedReviewConsiderations, true).Description("The number of review consideration requests that are granted / awarded");
        Field(x => x.RequestedClarifications, true).Description("The number of clarification requests that were submitted to this dispute.");
        Field(x => x.AwardedClarifications, true).Description("The number of clarification requests that are granted / awarded");
        Field(x => x.RequestedCorrections, true).Description("The number of correction requests that were submitted to this dispute.");
        Field(x => x.AwardedCorrections, true).Description("The number of review consideration requests that are granted / awarded");
        Field(x => x.FirstParticipatoryHearingDateTime, true).Description("The first hearing date time of a dispute");
        Field(x => x.FirstParticipatoryHearingDateTimeId, true).Description("The first hearing date time Id of a dispute");
        Field(x => x.DisputeComplexity, true).Description("The complexity rating of a dispute");
        Field(x => x.FirstDecisionDateTime, true).Description("The date that the first decision was added to the dispute");
        Field(x => x.FirstDecisionDateTimeId, true).Description("The date Id that the first decision was added to the dispute");
    }
}

public class DisputeCreationMethodEnum : EnumerationGraphType<DisputeCreationMethod>
{
    public DisputeCreationMethodEnum()
    {
        Name = "DisputeCreationMethodEnum";
    }
}

public class DisputeTypeEnum : EnumerationGraphType<DisputeType>
{
    public DisputeTypeEnum()
    {
        Name = "DisputeTypeEnum";
    }
}

public class PaymentMethodEnum : EnumerationGraphType<PaymentMethod>
{
    public PaymentMethodEnum()
    {
        Name = "PaymentMethodEnum";
    }
}

public class DisputeSubTypeEnum : EnumerationGraphType<DisputeSubType>
{
    public DisputeSubTypeEnum()
    {
        Name = "DisputeSubTypeEnum";
    }
}

public class MigrationSourceOfTruthEnum : EnumerationGraphType<MigrationSourceOfTruth>
{
    public MigrationSourceOfTruthEnum()
    {
        Name = "MigrationSourceOfTruthEnum";
    }
}

public class DisputeUrgencyEnum : EnumerationGraphType<DisputeUrgency>
{
    public DisputeUrgencyEnum()
    {
        Name = "DisputeUrgencyEnum";
    }
}

public class DisputeStageEnum : EnumerationGraphType<DisputeStage>
{
    public DisputeStageEnum()
    {
        Name = "DisputeStageEnum";
    }
}

public class DisputeStatusesEnum : EnumerationGraphType<DisputeStatuses>
{
    public DisputeStatusesEnum()
    {
        Name = "DisputeStatusesEnum";
    }
}

public class DisputeProcessEnum : EnumerationGraphType<DisputeProcess>
{
    public DisputeProcessEnum()
    {
        Name = "DisputeProcessEnum";
    }
}