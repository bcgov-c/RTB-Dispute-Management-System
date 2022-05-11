using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AuditLog;

public class AuditLogResponse
{
    [JsonProperty("audit_log_id")]
    public int AuditLogId { get; set; }

    [JsonProperty("associated_record_id")]
    public int? AssociatedRecordId { get; set; }

    [JsonProperty("api_call_type")]
    public string ApiCallType { get; set; }

    [JsonProperty("api_name")]
    public string ApiName { get; set; }

    [JsonProperty("submitted_date")]
    public string ChangeDate { get; set; }

    [JsonProperty("submitter_role")]
    public int SubmitterRole { get; set; }

    [JsonProperty("submitter_user_id")]
    public int? SubmitterUserId { get; set; }

    [JsonProperty("submitter_participant_id")]
    public int? SubmitterParticipantId { get; set; }

    [JsonProperty("submitter_name")]
    public string SubmitterName { get; set; }
}