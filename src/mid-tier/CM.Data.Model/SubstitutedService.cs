using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class SubstitutedService : BaseEntity
{
    public int SubstitutedServiceId { get; set; }

    public Guid DisputeGuid { get; set; }

    public Dispute Dispute { get; set; }

    public bool? IsDeleted { get; set; }

    public int ServiceByParticipantId { get; set; }

    public Participant ServiceByParticipant { get; set; }

    public int ServiceToParticipantId { get; set; }

    public Participant ServiceToParticipant { get; set; }

    public byte RequestDocType { get; set; }

    [StringLength(255)]
    public string RequestDocOtherDescription { get; set; }

    public byte? FailedMethod1Type { get; set; }

    [StringLength(255)]
    public string FailedMethod1Description { get; set; }

    [StringLength(100)]
    public string FailedMethod1Specifics { get; set; }

    public DateTime? FailedMethod1Date { get; set; }

    [StringLength(255)]
    public string FailedMethod1Note { get; set; }

    public int? FailedMethod1FileDescId { get; set; }

    public FileDescription FailedMethod1FileDesc { get; set; }

    public byte? FailedMethod2Type { get; set; }

    [StringLength(255)]
    public string FailedMethod2Description { get; set; }

    [StringLength(100)]
    public string FailedMethod2Specifics { get; set; }

    public DateTime? FailedMethod2Date { get; set; }

    [StringLength(255)]
    public string FailedMethod2Note { get; set; }

    public int? FailedMethod2FileDescId { get; set; }

    public FileDescription FailedMethod2FileDesc { get; set; }

    public byte? FailedMethod3Type { get; set; }

    [StringLength(255)]
    public string FailedMethod3Description { get; set; }

    [StringLength(100)]
    public string FailedMethod3Specifics { get; set; }

    public DateTime? FailedMethod3Date { get; set; }

    [StringLength(255)]
    public string FailedMethod3Note { get; set; }

    public int? FailedMethod3FileDescId { get; set; }

    public FileDescription FailedMethod3FileDesc { get; set; }

    [StringLength(255)]
    public string OtherFailedMethodDetails { get; set; }

    public byte? IsRespondentAvoiding { get; set; }

    [StringLength(255)]
    public string RespondentAvoidingDetails { get; set; }

    public byte? RequestingTimeExtension { get; set; }

    public DateTime? RequestingTimeExtensionDate { get; set; }

    public byte? RequestingServiceDirections { get; set; }

    [StringLength(500)]
    public string RequestedMethodDescription { get; set; }

    [StringLength(500)]
    public string RequestedMethodJustification { get; set; }

    public int? RequestMethodFileDescId { get; set; }

    public FileDescription RequestMethodFileDesc { get; set; }

    [StringLength(255)]
    public string RequestNotes { get; set; }

    public byte? RequestStatus { get; set; }

    public int? SubServiceApprovedById { get; set; }

    public SystemUser SubServiceApprovedBy { get; set; }

    [StringLength(100)]
    public string SubServiceTitle { get; set; }

    [StringLength(2000)]
    public string SubServiceInstructions { get; set; }

    public DateTime? SubServiceEffectiveDate { get; set; }

    public DateTime? SubServiceExpiryDate { get; set; }

    public byte? SubServiceDocType { get; set; }

    [StringLength(100)]
    public string SubServiceOtherDescription { get; set; }

    public int? OutcomeDocumentFileId { get; set; }

    public OutcomeDocFile OutcomeDocumentFile { get; set; }

    public byte RequestSource { get; set; }

    [StringLength(255)]
    public string RequestAdditionalInfo { get; set; }
}