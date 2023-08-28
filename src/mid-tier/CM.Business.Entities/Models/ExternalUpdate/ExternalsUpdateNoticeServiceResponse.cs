using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ExternalUpdate;

public class ExternalsUpdateNoticeServiceResponse
{
    [JsonProperty("notice_service_id")]
    public int NoticeServiceId { get; set; }

    [JsonProperty("participant_id")]
    public int ParticipantId { get; set; }

    [JsonProperty("service_method")]
    public byte? ServiceMethod { get; set; }

    [JsonProperty("service_date")]
    public string ServiceDate { get; set; }

    [JsonProperty("service_comment")]
    public string ServiceComment { get; set; }

    [JsonProperty("served_by")]
    public int? ServedBy { get; set; }

    [JsonProperty("is_served")]
    public bool? IsServed { get; set; }

    [JsonProperty("proof_file_description_id")]
    public int? ProofFileDescriptionId { get; set; }

    [JsonProperty("modified_date")]
    public string ModifiedDate { get; set; }

    [JsonProperty("validation_status")]
    public byte? ValidationStatus { get; set; }
}