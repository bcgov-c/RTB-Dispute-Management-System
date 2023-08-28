using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AccessCode;

public class DisputeAccessNoticeService
{
    [JsonProperty("notice_id")]
    public int NoticeId { get; set; }

    [JsonProperty("notice_service_id")]
    public int NoticeServiceId { get; set; }

    [JsonProperty("participant_id")]
    public int ParticipantId { get; set; }

    [JsonProperty("served_by")]
    public int? ServedBy { get; set; }

    [JsonProperty("is_served")]
    public bool? IsServed { get; set; }

    [JsonProperty("service_method")]
    public byte? ServiceMethod { get; set; }

    [JsonProperty("service_date")]
    public string ServiceDate { get; set; }

    [JsonProperty("proof_file_description_id")]
    public int? ProofFileDescriptionId { get; set; }

    [JsonProperty("validation_status")]
    public byte? ValidationStatus { get; set; }

    [JsonProperty("has_service_deadline")]
    public bool? HasServiceDeadline { get; set; }

    [JsonProperty("service_deadline_days")]
    public int? ServiceDeadlineDays { get; set; }

    [JsonProperty("service_deadline_date")]
    public string ServiceDeadlineDate { get; set; }

    [JsonProperty("modified_date")]
    public string ModifiedDate { get; set; }

    [JsonProperty("modified_by")]
    public int? ModifiedBy { get; set; }

    [JsonProperty("other_proof_file_description_id")]
    public int? OtherProofFileDescriptionId { get; set; }

    [JsonProperty("second_service_deadline_date")]
    public string SecondServiceDeadlineDate { get; set; }
}