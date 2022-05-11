using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;

namespace CM.Data.Model;

public class Dispute : BaseEntity
{
    public int DisputeId { get; set; }

    [Required]
    public Guid DisputeGuid { get; set; }

    public SystemUser SystemUser { get; set; }

    public int OwnerSystemUserId { get; set; }

    public byte? OwnerRole { get; set; }

    public Guid? OwnerGuid { get; set; }

    public int? FileNumber { get; set; }

    public byte? DisputeType { get; set; }

    public byte? DisputeSubType { get; set; }

    public byte? DisputeUrgency { get; set; }

    public DisputeComplexity? DisputeComplexity { get; set; }

    [StringLength(80)]
    public string TenancyAddress { get; set; }

    [StringLength(50)]
    public string TenancyCity { get; set; }

    [StringLength(50)]
    public string TenancyCountry { get; set; }

    [StringLength(7)]
    public string TenancyZipPostal { get; set; }

    public byte? TenancyEnded { get; set; }

    public DateTime? TenancyEndDate { get; set; }

    public byte? TenancyGeozoneId { get; set; }

    public byte? TenancyAddressValidated { get; set; }

    public int? CrossAppFileNumber { get; set; }

    public Guid? CrossAppDisputeGuid { get; set; }

    public byte? CrossAppRole { get; set; }

    public bool? OriginalNoticeDelivered { get; set; }

    public DateTime? OriginalNoticeDate { get; set; }

    public int? OriginalNoticeId { get; set; }

    public byte? CreationMethod { get; set; }

    public DateTime? TenancyAgreementDate { get; set; }

    public byte? TenancyAgreementSignedBy { get; set; }

    public byte? MigrationSourceOfTruth { get; set; }

    public DateTime? SubmittedDate { get; set; }

    public int? SubmittedBy { get; set; }

    public bool? IsAmended { get; set; }

    public DateTime? InitialPaymentDate { get; set; }

    public int? InitialPaymentBy { get; set; }

    public byte? InitialPaymentMethod { get; set; }

    public DateTime? TenancyStartDate { get; set; }

    public decimal? SecurityDepositAmount { get; set; }

    public decimal? PetDamageDepositAmount { get; set; }

    public decimal? RentPaymentAmount { get; set; }

    [StringLength(100)]
    public string RentPaymentInterval { get; set; }

    public DisputeLastModified DisputeLastModified { get; set; }

    public int? TenancyUnits { get; set; }

    public TenancyUnitType? TenancyUnitType { get; set; }

    [StringLength(50)]
    public string TenancyUnitText { get; set; }

    public DisputeStorageType FilesStorageSetting { get; set; }

    public virtual ICollection<DisputeStatus> DisputeStatuses { get; set; }

    public virtual ICollection<DisputeProcessDetail> DisputeProcessDetails { get; set; }

    public virtual ICollection<DisputeUser> DisputeUsers { get; set; }

    public virtual ICollection<IntakeQuestion> IntakeQuestions { get; set; }

    public virtual ICollection<ClaimGroup> ClaimGroups { get; set; }

    public virtual ICollection<Participant> Participants { get; set; }

    public virtual ICollection<ClaimGroupParticipant> ClaimGroupParticipants { get; set; }

    public virtual ICollection<EmailMessage> EmailMessages { get; set; }

    public virtual ICollection<DisputeFee> DisputeFees { get; set; }

    public virtual ICollection<File> Files { get; set; }

    public virtual ICollection<FileDescription> FileDescriptions { get; set; }

    public virtual ICollection<FilePackage> FilePackages { get; set; }

    public virtual ICollection<LinkedFile> LinkedFiles { get; set; }

    public virtual ICollection<Notice> Notices { get; set; }

    public virtual ICollection<Amendment> Amendments { get; set; }

    public virtual ICollection<Note> Notes { get; set; }

    public virtual ICollection<Task> Tasks { get; set; }

    public virtual ICollection<OutcomeDocGroup> OutcomeDocGroups { get; set; }

    public virtual ICollection<OutcomeDocFile> OutcomeDocFiles { get; set; }

    public virtual ICollection<OutcomeDocDelivery> OutcomeDocDocDeliveries { get; set; }

    public virtual ICollection<DisputeHearing> DisputeHearings { get; set; }

    public virtual ICollection<HearingParticipation> HearingParticipations { get; set; }

    public virtual ICollection<BulkEmailRecipient> BulkEmailRecipients { get; set; }

    public virtual ICollection<HearingAuditLog> HearingAuditLogs { get; set; }

    public virtual ICollection<CustomDataObject> CustomDataObjects { get; set; }

    public virtual ICollection<OutcomeDocRequest> OutcomeDocRequests { get; set; }

    public virtual ICollection<DisputeFlag> DisputeFlags { get; set; }

    public virtual ICollection<SubmissionReceipt> SubmissionReceipts { get; set; }

    public virtual ICollection<TrialDispute> TrialDisputes { get; set; }
}