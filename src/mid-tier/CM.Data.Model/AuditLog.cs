using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class AuditLog
{
    public int AuditLogId { get; set; }

    public Guid? DisputeGuid { get; set; }

    public int? AssociatedRecordId { get; set; }

    [StringLength(10)]
    [Required]
    public string ApiCallType { get; set; }

    [StringLength(100)]
    [Required]
    public string ApiName { get; set; }

    [Required]
    public string ApiCallData { get; set; }

    [StringLength(10)]
    public string ApiResponse { get; set; }

    public string ApiErrorResponse { get; set; }

    [Required]
    public DateTime ChangeDate { get; set; }

    [Required]
    public int SubmitterRole { get; set; }

    public int? SubmitterUserId { get; set; }

    public SystemUser SystemUser { get; set; }

    public int? SubmitterParticipantId { get; set; }

    public Participant SubmitterParticipant { get; set; }

    [StringLength(50)]
    public string SubmitterName { get; set; }
}