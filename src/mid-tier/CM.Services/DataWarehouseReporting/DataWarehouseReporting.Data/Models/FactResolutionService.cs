using System;
using System.ComponentModel.DataAnnotations;

namespace DataWarehouseReporting.Data.Models
{
    public class FactResolutionService
    {
        [Key]
        public int ResolutionServiceRecordId { get; set; }

        public DateTime LoadDateTime { get; set; }

        public int AssociatedOffice { get; set; }

        public bool IsActive { get; set; }

        public bool IsPublic { get; set; }

        public Guid? DisputeGuid { get; set; }

        public int? OutcomeDocGroupId { get; set; }

        public DateTime? DocGroupCreatedDate { get; set; }

        public int? DocGroupCreatedById { get; set; }

        public int? DocStatus { get; set; }

        public DateTime? DocStatusDate { get; set; }

        public int? DerivedDocumentType { get; set; }

        public int? TotalDocuments { get; set; }

        [StringLength(75)]
        public string DocumentFileTypes { get; set; }

        public bool? ContainsVisibleToPublic { get; set; }

        public bool? ContainsMateriallyDifferent { get; set; }

        public bool? ContainsNoteworthy { get; set; }

        public bool? AssociatedToPriorHearing { get; set; }

        public int? PriorHearingId { get; set; }

        public int? PriorSharedHearingLinkingType { get; set; }

        public int? PriorLinkedDisputes { get; set; }

        public int? PriorHearingDuration { get; set; }

        public int? PriorHearingComplexity { get; set; }

        public bool? ContainsReviewReplacement { get; set; }

        public bool? ContainsCorrectionReplacement { get; set; }

        public int? TotalDocumentsDelivered { get; set; }

        public int? DocumentsDeliveredMail { get; set; }

        public int? DocumentsDeliveredEmail { get; set; }

        public int? DocumentsDeliveredPickup { get; set; }

        public int? DocumentsDeliveredOther { get; set; }

        public DateTime? LatestReadyForDeliveryDate { get; set; }

        public DateTime? LatestDeliveryDate { get; set; }

        public int? DeliveryPriority { get; set; }

        public int? DocPreparationTime { get; set; }

        public int? DocWritingTime { get; set; }

        public int? DocComplexity { get; set; }

        public DateTime? DocCompletedDate { get; set; }

        public int? Applicants { get; set; }

        public int? Respondents { get; set; }

        public int? Issues { get; set; }

        public int? DisputeUrgency { get; set; }

        public int? DisputeCreationMethod { get; set; }

        public int? LastStage { get; set; }

        public int? LastStatus { get; set; }

        public int? LastProcess { get; set; }

        public DateTime? LastStatusDateTime { get; set; }

        public int? DisputeType { get; set; }

        public int? DisputeSubType { get; set; }

        public int? CreationMethod { get; set; }

        public DateTime? SubmittedDateTime { get; set; }

        public DateTime? InitialPaymentDateTime { get; set; }

        public int? EvidenceFiles { get; set; }

        public decimal? EvidenceFilesMb { get; set; }
    }
}
