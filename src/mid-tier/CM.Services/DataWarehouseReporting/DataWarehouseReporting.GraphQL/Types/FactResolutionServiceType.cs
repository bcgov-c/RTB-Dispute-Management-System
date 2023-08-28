using DataWarehouseReporting.Data.Models;
using GraphQL.Types;

namespace DataWarehouseReporting.GraphQL.Types
{
    public sealed class FactResolutionServiceType : ObjectGraphType<FactResolutionService>
    {
        public FactResolutionServiceType()
        {
            Name = "FactResolutionServiceType";
            Description = "FactResolutionServiceType";

            Field(x => x.ResolutionServiceRecordId).Description("Auto incrementing primary key");
            Field(x => x.LoadDateTime).Description("The date/time the record was inserted into the DW");
            Field(x => x.AssociatedOffice).Description("The ID of the office (1=RTB BC - PST)");
            Field(x => x.IsActive).Description("Whether the record is active in the DW (0=No/Inactive, 1=Yes/Active)");
            Field(x => x.IsPublic).Description("Whether the record is public in the DW (0=No/private, 1=Yes/public)");
            Field(x => x.DisputeGuid, true).Description("The guid of the associated dispute");
            Field(x => x.OutcomeDocGroupId, true).Description("The ID of the associated outcome document group");
            Field(x => x.DocGroupCreatedDate, true).Description("The date (UTC) that the outcome document group was created");
            Field(x => x.DocGroupCreatedById, true).Description("The ID of the user that created the outcome document group");
            Field(x => x.DocStatus, true).Description("The status of the outcome document group when it was loaded");
            Field(x => x.DocStatusDate, true).Description("The date (UTC) that the document status was last set");
            Field(x => x.DerivedDocumentType, true).Description("The detected core document type (1=decision, contains 2,3,4,70,71,5,6,7,8, 2=Interim Decision, contains 30,31,32,33,34,35, 3=CCR, contains 25,40,41,42,45,46,47, 4=SS, contains 50)");
            Field(x => x.TotalDocuments, true).Description("A count of the files associated to the outcome document group (not including anonymized decisions or working documents)");
            Field(x => x.DocumentFileTypes).Description("A comma separated list of all filetypes in the document group (not including anonymized decisions or working documents)");
            Field(x => x.ContainsVisibleToPublic, true).Description("Whether or not the outcome document group includes a public document");
            Field(x => x.ContainsMateriallyDifferent, true).Description("Whether or not any of the included files is marked as materially different");
            Field(x => x.ContainsNoteworthy, true).Description("Whether or not any of the included files is marked as noteworthy");
            Field(x => x.AssociatedToPriorHearing, true).Description("Whether or not the associated document work is associated to the prior hearing");
            Field(x => x.PriorHearingId, true).Description("The ID of the associated to the latest past (ended) hearing");
            Field(x => x.PriorSharedHearingLinkingType, true).Description("The shared hearing link type of this dispute for the latest past (ended) hearing");
            Field(x => x.PriorLinkedDisputes, true).Description("The count of dispute files linked to the latest past (ended) hearing");
            Field(x => x.PriorHearingDuration, true).Description("The hearing duration of the latest past hearing on the dispute file (if it exists)");
            Field(x => x.PriorHearingComplexity, true).Description("The hearing complexity of the latest past hearing on the dispute file (if it exists)");
            Field(x => x.ContainsReviewReplacement, true).Description("Whether the outcome document group contains a replacement decision from a review hearing");
            Field(x => x.ContainsCorrectionReplacement, true).Description("Whether the outcome document group contains a corrected decision");
            Field(x => x.TotalDocumentsDelivered, true).Description("The total documents that were delivered");
            Field(x => x.DocumentsDeliveredMail, true).Description("The total documents that were delivered by mail");
            Field(x => x.DocumentsDeliveredEmail, true).Description("The total documents that were delivered by email");
            Field(x => x.DocumentsDeliveredPickup, true).Description("The total documents that were delivered through pickup");
            Field(x => x.DocumentsDeliveredOther, true).Description("The total documents that were delivered by other method");
            Field(x => x.LatestReadyForDeliveryDate, true).Description("The date the document set was marked ready to deliver (last ready to deliver date of all documents)");
            Field(x => x.LatestDeliveryDate, true).Description("The date the last document was delivered (max delivery date of all documents)");
            Field(x => x.DeliveryPriority, true).Description("The priority of the document delivery, 0 means not set by arbitrator (0: Not set, 1: Low, 2: Normal, 3: High)");
            Field(x => x.DocPreparationTime, true).Description("The amount of preparation time entered by the resolution staff for the document work");
            Field(x => x.DocWritingTime, true).Description("The amount of writing time entered by the resolution staff for the document work");
            Field(x => x.DocComplexity, true).Description("The assocaited complexity of the outcome document group");
            Field(x => x.DocCompletedDate, true).Description("The associated completion date of the outcome document group");
            Field(x => x.Applicants, true).Description("The total active applicants on the dispute");
            Field(x => x.Respondents, true).Description("The total active respondents on the dispute");
            Field(x => x.Issues, true).Description("Total count of active issues on this dispute file");
            Field(x => x.DisputeUrgency, true).Description("The urgency for grouping (1=Emergency, 2=Regular, 3=Deferred)");
            Field(x => x.DisputeCreationMethod, true).Description("The creation method for grouping (see lookups)");
            Field(x => x.LastStage, true).Description("The ID of the Stage of the active dispute status record (IsActive - true),  (see PSSO)");
            Field(x => x.LastStatus, true).Description("The ID of the Status of the active dispute status record (IsActive - true), (see PSSO)");
            Field(x => x.LastProcess, true).Description("The ID of the Process of the active dispute status record (IsActive - true),  (1-7, see PSSO)");
            Field(x => x.LastStatusDateTime, true).Description("The StatusStartDate of the active dispute status record (IsActive = true) when the record was loaded");
            Field(x => x.DisputeType, true).Description("The type of the dispute for grouping  1=RTA, 2=MHPTA");
            Field(x => x.DisputeSubType, true).Description("The subtype of the dispute for grouping 0=Applicant is Landlord, 1= Applicant is Tenant");
            Field(x => x.CreationMethod, true).Description("The creation method for grouping ( 1=online, 2=manual/paper, 3=Legacy service portal)");
            Field(x => x.SubmittedDateTime, true).Description("The exact date-time it was submitted");
            Field(x => x.InitialPaymentDateTime, true).Description("The exact date-time the initial payment was made");
            Field(x => x.EvidenceFiles, true).Description("The total evidence files on the dispute regardless of whether the participant or associated issues were removed by amendment or arbitrator actions.");
            Field(x => x.EvidenceFilesMb, true).Description("The total MB of evidence files on the dispute");
        }
    }
}
