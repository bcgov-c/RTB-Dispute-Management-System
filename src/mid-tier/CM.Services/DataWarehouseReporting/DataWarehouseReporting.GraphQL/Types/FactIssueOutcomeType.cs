using DataWarehouseReporting.Data.Models;
using GraphQL.Types;

namespace DataWarehouseReporting.GraphQL.Types
{
    public class FactIssueOutcomeType : ObjectGraphType<FactIssueOutcome>
    {
        public FactIssueOutcomeType()
        {
            Name = "FactIssueOutcomeType";
            Description = "FactIssueOutcomeType";

            Field(x => x.IssueOutcomeRecordId).Description("Auto incrementing primary key");
            Field(x => x.LoadDateTime).Description("The date/time the record was inserted into the DW");
            Field(x => x.AssociatedOffice).Description("The ID of the office (1=RTB BC - PST)");
            Field(x => x.IsActive).Description("Whether the record is active in the DW (0=No/Inactive, 1=Yes/Active)");
            Field(x => x.IsPublic).Description("Whether the record is public in the DW (0=No/private, 1=Yes/public)");
            Field(x => x.DisputeGuid, true).Description("The guid of the associated dispute");
            Field(x => x.ClaimGroupId, true).Description("The ID of the associated claim group");
            Field(x => x.ClaimId, true).Description("The ID of the assocaited claim");
            Field(x => x.ClaimCreatedDate, true).Description("The date that the claim was created on in DMS");
            Field(x => x.AwardDate, true).Description("The date on which the remedy was awarded (or the remedy modifedDate)");
            Field(x => x.AwardedBy, true).Description("The userID that last modified the outcome (Remedy.ModifiedBy)");
            Field(x => x.ClaimCode, true).Description("The associated claim code for identifying the specific issue (see lookups)");
            Field(x => x.IsAmended, true).Description("Whether or not the claim was amended (0=false, 1=true)");
            Field(x => x.RemedyStatus, true).Description("The status or outcome of the issue as decided in the hearing (see lookups)");
            Field(x => x.RemedySubStatus, true).Description("The substatus of outcome of the issue (see lookups)");
            Field(x => x.RequestedAmount, true).Description("The amount that was requested for monetary issues");
            Field(x => x.AwardedAmount, true).Description("The amount that was awarded for monetary issues");
            Field(x => x.AwardedDate, true).Description("The date on which posession was awarded");
            Field(x => x.AwardedDaysAfterService, true).Description("The days after service on which possession was awarded");
            Field(x => x.IsReviewed, true).Description("Whether the issue was reviewed (review hearing - 0=false,1=true)");
            Field(x => x.PrevRemedyStatus, true).Description("The remedy status before it was updated in the review hearing");
            Field(x => x.PrevAwardDate, true).Description("The date on which the previous outcome was awarded");
            Field(x => x.PrevAwardedBy, true).Description("The user ID that awarded the previous remedy (last modified the remedy with the previous awarded outcome)");
            Field(x => x.PrevAwardedDate, true).Description("The awarded date value before it was updated in the review hearing");
            Field(x => x.PrevAwardedDaysAfterService, true).Description("The awarded days after service value before it was updated in the review hearing");
            Field(x => x.PrevAwardedAmount, true).Description("The awarded amount before it was updated in the review hearing");
            Field(x => x.DisputeUrgency, true).Description("The urgency for grouping (1=Emergency, 2=Regular, 3=Deferred)");
            Field(x => x.DisputeType, true).Description("The type of the dispute for grouping  1=RTA, 2=MHPTA");
            Field(x => x.DisputeSubType, true).Description("The subtype of the dispute for grouping 0=Applicant is Landlord, 1= Applicant is Tenant");
            Field(x => x.DisputeCreationMethod, true).Description("The creation method for grouping ( 1=online, 2=manual/paper, 3=Legacy service portal)");
            Field(x => x.SubmittedDateTime, true).Description("The exact date-time it was submitted");
            Field(x => x.InitialPaymentDateTime, true).Description("The exact date-time the initial payment was made");
            Field(x => x.InitialPaymentMethod, true).Description("The method used for the initial payment (1=online, 2=office, 3=fee waiver)");
        }
    }
}
