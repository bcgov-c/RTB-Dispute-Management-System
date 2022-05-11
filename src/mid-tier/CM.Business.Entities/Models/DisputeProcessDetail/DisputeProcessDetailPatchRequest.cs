using Newtonsoft.Json;

namespace CM.Business.Entities.Models.DisputeProcessDetail;

public class DisputeProcessDetailPatchRequest : DisputeProcessDetailRequestBase
{
    [JsonProperty("process_duration")]
    public int? ProcessDuration { get; set; }

    [JsonProperty("process_complexity")]
    public byte? ProcessComplexity { get; set; }

    [JsonProperty("process_method")]
    public byte? ProcessMethod { get; set; }

    [JsonProperty("process_outcome_code")]
    public byte? ProcessOutcomeCode { get; set; }

    [JsonProperty("process_reason_code")]
    public byte? ProcessReasonCode { get; set; }

    [JsonProperty("process_outcome_title")]
    public string ProcessOutcomeTitle { get; set; }

    [JsonProperty("process_outcome_description")]
    public string ProcessOutcomeDescription { get; set; }

    [JsonProperty("process_outcome_note")]
    public string ProcessOutcomeNote { get; set; }
}