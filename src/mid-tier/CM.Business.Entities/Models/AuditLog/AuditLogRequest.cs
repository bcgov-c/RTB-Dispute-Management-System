using System;

namespace CM.Business.Entities.Models.AuditLog;

public class AuditLogRequest
{
    public Guid DisputeGuid { get; set; }

    public int? AssociatedRecordId { get; set; }

    public string ApiCallType { get; set; }

    public string ApiName { get; set; }

    public string ApiCallData { get; set; }

    public string ApiResponse { get; set; }

    public string ApiErrorResponse { get; set; }

    public DateTime ChangeDate { get; set; }

    public int SubmitterRole { get; set; }

    public int? SubmitterUserId { get; set; }

    public int? SubmitterParticipantId { get; set; }

    public string SubmitterName { get; set; }
}