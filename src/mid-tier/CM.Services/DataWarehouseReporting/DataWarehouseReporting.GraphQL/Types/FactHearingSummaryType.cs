using DataWarehouseReporting.Data.Models;
using GraphQL.Types;

namespace DataWarehouseReporting.GraphQL.Types;

public sealed class FactHearingSummaryType : ObjectGraphType<FactHearingSummary>
{
    public FactHearingSummaryType()
    {
        Name = "FactHearingSummaryType";
        Description = "FactHearingSummaryType";

        Field(x => x.HearingSummaryRecordId).Description("Auto incrementing primary key");
        Field(x => x.LoadDateTime).Description("The date/time the record was inserted into the DW");
        Field(x => x.AssociatedOffice).Description("The ID of the office (1=RTB BC)");
        Field(x => x.IsActive).Description("Whether the record is active in the DW (0=No/Inactive, 1=Yes/Active)");
        Field(x => x.IsPublic).Description("Whether the record is public in the DW (0=No/private, 1=Yes/public)");
        Field(x => x.HearingId).Description("The unique id of the hearing that is being loaded into the DW");
        Field(x => x.DisputeGuid, true).Description("The disputeguid of the primary file that is linked to the hearing");
        Field(x => x.SharedHearingLinkingType, true).Description("The type of linking (1=single, 2=cross application, 3=joiner application, 4=repeat applications, 5=cross repeat)");
        Field(x => x.LinkedDisputes, true).Description("Number of Dispute files associated to this hearing");
        Field(x => x.SecondaryDisputeGuids).Description("A comma separated list of the secondary disputeguids also linked to this hearing");
        Field(x => x.LocalHearingStartDateTime, true).Description("The PST start time of the hearing");
        Field(x => x.LocalHearingEndDateTime, true).Description("The PST end time of the hearing");
        Field(x => x.HearingStartDateTime, true).Description("The UTC start time of the hearing");
        Field(x => x.HearingEndDateTime, true).Description("The UTC end time of the hearing");
        Field(x => x.HearingOwner, true).Description("The ID of the abitrator that was assigned the hearing");
        Field(x => x.HearingPriority, true).Description("The priority of the hearing");
        Field(x => x.HearingDuration, true).Description("The duration of the hearing in minutes");
        Field(x => x.HearingMethod, true).Description("The method of the hearing ");
        Field(x => x.HearingType, true).Description("The type of hearing (1=conference call, 2=face to face)");
        Field(x => x.HearingParticipations, true).Description("The total number of participants that attended the hearing");
        Field(x => x.HearingAttendingApplicants, true).Description("The count of applicants that attended the hearing");
        Field(x => x.HearingAttendingRespondents, true).Description("The count of respondents that attended the hearing");
        Field(x => x.PrimaryHearings, true).Description("This is the count of total hearings that have occurred in the past including this one that are associated to the primary disputeguid");
        Field(x => x.PrimaryAdjourned, true).Description("Whether there is adjourned status in the primary dispute. It’s true/false.");
        Field(x => x.PrimaryPreviousHearingId, true).Description("The hearing ID of the previous hearing linked to the primary file (if exists, null if does not exist)");
        Field(x => x.PrimaryLastProcess, true).Description("The current primary file process at time of load");
        Field(x => x.PrimaryLastStage, true).Description("The current primary file Stage at time of load");
        Field(x => x.PrimaryLastStatus, true).Description("That current primary file stat at time of load");
        Field(x => x.PrimaryDisputeType, true).Description("The main type of the primary dispute.  1=RTA, 2=MHPTA");
        Field(x => x.PrimaryDisputeSubType, true).Description("The subtype of the primary dispute.  0=Applicant is Landlord, 1= Applicant is Tenant");
        Field(x => x.PrimaryTenancyUnitType, true).Description("What the indicator is for shared units if address is shared (same main address) - 1=basement, 2=upper, 3=lower, 4=main, 5=coach house, 6=laneway, 7=other");
        Field(x => x.PrimaryCreationMethod, true).Description("The method used to file the dispute ( 1=online standard intake, 2=manual/paper, 3=Data Migration, 4= Online Rent Increase, 5=Paper Rent Increase, 6=Possession for Renovation)");
        Field(x => x.PrimaryTenancyEnded, true).Description("Whether the primary file tenancy was ended (0=false, 1=true)");
        Field(x => x.PrimaryTenancyEndDateTime, true).Description("The date the primary file tenancy ended (UTC)");
        Field(x => x.PrimaryDisputeUrgency, true).Description("The primary file dispute urgency ");
        Field(x => x.PrimarySubmittedDateTime, true).Description("The primary file submitted date (UTC)");
        Field(x => x.PrimaryInitialPaymentDateTime, true).Description("The primary file initial payment date (UTC)");
        Field(x => x.PrimaryParticipants, true).Description("The total active participants on the primary file");
        Field(x => x.PrimaryApplicants, true).Description("The total active applicants on the primary file ");
        Field(x => x.PrimaryRespondents, true).Description("The total active respondents on the primary file ");
        Field(x => x.PrimaryTimeSinceInitialPaymentMin, true).Description("Time between initial payment and hearing start in minutes");
        Field(x => x.PrimaryTimeSinceSubmittedMin, true).Description("Time between submitted and hearing start in minutes");
        Field(x => x.PrimaryProcesses, true).Description("Count of unique processes on the primary file");
        Field(x => x.PrimaryStatuses, true).Description("Count of unique statuses on the primary file");
        Field(x => x.PrimarySentEmailMessages, true).Description("Count of email messages on the primary file");
        Field(x => x.PrimaryAmendments, true).Description("Count of amendments on the primary file");
        Field(x => x.PrimarySubServiceRequests, true).Description("Count of sub serve requests on primary file");
        Field(x => x.PrimaryTotalArbTimeMin, true).Description("Sum of arb status time on primary file");
        Field(x => x.PrimaryTotalArbOwners, true).Description("Sum or arb owners on the primary file");
        Field(x => x.PrimaryTotalStage6TimeMin, true).Description("Sum of stage 6 time on primary file at time of load");
        Field(x => x.PrimaryTotalStage8TimeMin, true).Description("Sum of stage 8 time on primary file at time of load");
        Field(x => x.AllLinkedEvidenceFiles, true).Description("Total number of evidence files on all linked disputes");
        Field(x => x.AllLinkedEvidenceFilesMb, true).Description("Total MB size of evidence files on all linked disputes");
        Field(x => x.AllLinkedIssues, true).Description("Total count of active issues on all linked disputes");
        Field(x => x.AllLinkedIssueCodes).Description("Comma separated list of active issue codes on all linked disputes - data example: “110, 112, 134”");
        Field(x => x.AllLinkedRequestedAmount, true).Description("Total sum or requested monetary amounts on all linked disputes");
        Field(x => x.PrimarySubmittedTimeId, true).Description("The ID of the associated time of the PrimarySubmittedDateTime");
        Field(x => x.PrimaryInitialPaymentTimeId, true).Description("The ID of the associated time of the PrimaryInitialPaymentDateTime");
        Field(x => x.HearingStartDateTimeId, true).Description("The ID of the associated time of the HearingStartDateTime");
        Field(x => x.HearingPrepTime, true).Description("The HearingPrepTime of the associated Hearing");
    }
}