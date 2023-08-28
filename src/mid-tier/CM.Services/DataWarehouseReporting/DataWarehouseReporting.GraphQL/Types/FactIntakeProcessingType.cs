using DataWarehouseReporting.Data.Models;
using GraphQL.Types;

namespace DataWarehouseReporting.GraphQL.Types
{
    public class FactIntakeProcessingType : ObjectGraphType<FactIntakeProcessing>
    {
        public FactIntakeProcessingType()
        {
            Name = "FactIntakeProcessingTypeType";
            Description = "FactIntakeProcessingType";

            Field(x => x.IntakeProcessingRecordId).Description("Auto incrementing primary key");
            Field(x => x.LoadDateTime).Description("The date/time the record was inserted into the DW");
            Field(x => x.AssociatedOffice).Description("The ID of the office (1=RTB BC - PST)");
            Field(x => x.IsActive).Description("Whether the record is active in the DW (0=No/Inactive, 1=Yes/Active)");
            Field(x => x.IsPublic).Description("Whether the record is public in the DW (0=No/private, 1=Yes/public)");
            Field(x => x.DisputeGuid, true).Description("The guid of the associated dispute");
            Field(x => x.ProcessStartDisputeStatusId, true).Description("The ID of the status records where the processing started");
            Field(x => x.ProcessStartDateTime, true).Description("The associated status start time to the ProcessStartDisputeStatusId");
            Field(x => x.ProcessStartProcess, true).Description("The associated process to the ProcessStartDisputeStatusId");
            Field(x => x.ProcessStartStage, true).Description("The associated status Stage to the ProcessStartDisputeStatusId");
            Field(x => x.ProcessStartStatus, true).Description("The associated Status to the ProcessStartDisputeStatusId");
            Field(x => x.ProcessEndDisputeStatusId, true).Description("The ID of the status record where the processing ended");
            Field(x => x.ProcessEndDateTime, true).Description("The associated status start time to the ProcessEndDateTimeId");
            Field(x => x.ProcessEndStage, true).Description("The associated stage to the ProcessEndDisputeStatusId");
            Field(x => x.ProcessEndStatus, true).Description("The associated status to the ProcessEndDisputeStatusId");
            Field(x => x.ProcessEndProcess, true).Description("The associated process to the ProcessEndDisputeStatusId");
            Field(x => x.UnassignedStage2TimeMin, true).Description("The time in stage 2 (sum duration seconds in min) where the file did not have an owner (owner is null) between ProcessStartDisputeStatusId and ProcessEndDisputeStatusId");
            Field(x => x.TimeIoAssignedMin, true).Description("The time only associated to IO processing with an owner (sum duration stage 2, status 20, 21, 22, 23, 24 and owner != null) between ProcessStartDisputeStatusId and ProcessEndDisputeStatusId");
            Field(x => x.TimeTotalProcessingMin, true).Description("The total processing time (sum duration seconds in min) of the intake processing between ProcessStartDisputeStatusId and ProcessEndDisputeStatusId");
            Field(x => x.ConfirmingInfoStatusTimeMin, true).Description("The total time of status 22 in imunutes between ProcessStartDisputeStatusId and ProcessEndDisputeStatusId");
            Field(x => x.ProcessDecReqStatusTimeMin, true).Description("The time associated to status 95 (process decision required) between ProcessStartDisputeStatusId and ProcessEndDisputeStatusId");
            Field(x => x.ProcessDecReqStatusAssignedTimeMin, true).Description("The time associated to status 95 (process decision required) between ProcessStartDisputeStatusId and ProcessEndDisputeStatusId where owner != null");
            Field(x => x.ScreenDecReqStatusTimeMin, true).Description("The time associated to status 96 (screening decision required) between ProcessStartDisputeStatusId and ProcessEndDisputeStatusId");
            Field(x => x.ScreenDecReqStatusAssignedTimeMin, true).Description("The time associated to status 96 (screening decision required)  between ProcessStartDisputeStatusId and ProcessEndDisputeStatusId where owner != null");
            Field(x => x.FirstAssignedDisputeStatusId, true).Description("The ID of the status record when an owner was first (min) assigned in intake processing between ProcessStartDisputeStatusId and ProcessEndDisputeStatusId");
            Field(x => x.FirstAssignedDateTime, true).Description("The date/time associated to the FirstAsssignedDisputeStatusId");
            Field(x => x.FirstAssignedStatus, true).Description("The status value associated to the FirstAsssignedDisputeStatusId");
            Field(x => x.FirstAssignedOwner, true).Description("The owner ID associated to the FirstAssignedDisputeStatusId");
            Field(x => x.LastAssignedDisputeStatusId, true).Description("The ID of the status record when an owner was last (max) assigned in intake processing between ProcessStartDisputeStatusId and ProcessEndDisputeStatusId");
            Field(x => x.LastAssignedDateTime, true).Description("The date/time associated to the LastAsssignedDisputeStatusId");
            Field(x => x.LastAssignedStatus, true).Description("The status value associated to the LastAsssignedDisputeStatusId");
            Field(x => x.LastAssignedOwner, true).Description("The owner ID associated to the LastAssignedDisputeStatusId");
            Field(x => x.ProcessingOwners, true).Description("The total number of unique owners (count distinct) assigned in intake processing between ProcessStartDisputeStatusId and ProcessEndDisputeStatusId");
            Field(x => x.ProcessingOwnersList, true).Description("A comma separated list of all distinct owners between ProcessStartDisputeStatusId and ProcessEndDisputeStatusId");
            Field(x => x.IntakeWasUpdated, true).Description("Whether the dispute has any status 1 or 6 status records in its status history (0/false, 1/true)");
            Field(x => x.TimeStatusNeedsUpdateMin, true).Description("The total time spent in status 1 and 6 in its status history");
            Field(x => x.HasArsDeadline, true).Description("The value of the latest notice “HasServiceDeadline” value for the latest notice if it exists or False");
            Field(x => x.Applicants, true).Description("The total active applicants on the dispute");
            Field(x => x.Respondents, true).Description("The total active respondents on the dispute");
            Field(x => x.Issues, true).Description("Total count of active issues on this dispute file");
            Field(x => x.DisputeUrgency, true).Description("The urgency for grouping (1=Emergency, 2=Regular, 3=Deferred)");
            Field(x => x.DisputeType, true).Description("The type of the dispute for grouping  1=RTA, 2=MHPTA");
            Field(x => x.DisputeSubType, true).Description("The subtype of the dispute for grouping 0=Applicant is Landlord, 1= Applicant is Tenant");
            Field(x => x.TenancyUnitType, true).Description("What the indicator is for shared units if address is shared  at the time the file was loaded (same main address) - 1=basement, 2=upper, 3=lower, 4=main, 5=coach house, 6=laneway, 7=other");
            Field(x => x.CreationMethod, true).Description("The creation method for grouping ( 1=online, 2=manual/paper, 3=Legacy service portal)");
            Field(x => x.DisputeComplexity, true).Description("The complexity associated to the dispute file");
            Field(x => x.TenancyEnded, true).Description("Whether the primary file tenancy was ended at the time the file was loaded (0=false, 1=true)");
            Field(x => x.TenancyEndDateTime, true).Description("The date the primary file tenancy ended at the time the file was loaded (UTC)");
            Field(x => x.InitialPaymentMethod, true).Description("The method that was used to make the initial application payment at the time the file was loaded");
            Field(x => x.SharedHearingLinkingType, true).Description("The value of the shared hearing role for this disputes latest hearing at the time the file was loaded (if it exists: 1=single, 2=cross application, 3=joiner application, 4=repeat applications, 5=cross repeat)");
            Field(x => x.DisputeHearingRole, true).Description("The dispute hearing role of this disputes latest hearing at the time the file was loaded (if it exists)");
            Field(x => x.LinkedDisputes, true).Description("Number of Dispute files associated to the latest hearing at the time the file was loaded (if it exists)");
            Field(x => x.HearingStartDateTime, true).Description("The UTC date/time of the latest hearing associated to this dispute file at the time the file was loaded");
            Field(x => x.Participants, true).Description("The total active participants on the dispute file at the time the file was loaded");
            Field(x => x.Processes, true).Description("The total count of unique processes on this dispute file at the time the file was loaded");
            Field(x => x.Statuses, true).Description("The total count of statuses on this dispute file at the time the file was loaded");
            Field(x => x.SubServiceRequests, true).Description("The total number of substituted service records submitted on this file  at the time the file was loaded");
            Field(x => x.SubmittedDateTime, true).Description("The exact date-time it was submitted");
            Field(x => x.InitialPaymentDateTime, true).Description("The exact date-time the initial payment was made");
            Field(x => x.EvidenceFiles, true).Description("The total evidence files on the dispute regardless of whether the participant or associated issues were removed by amendment or arbitrator actions.");
            Field(x => x.EvidenceFilesMb, true).Description("The total MB of evidence files on the dispute");
        }
    }
}
