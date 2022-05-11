using Newtonsoft.Json;

namespace CM.Business.Entities.Models.DisputeProcessDetail;

public class DisputeProcessDetailRequestBase
{
    [JsonProperty("process_applicant1_id")]
    public int? ProcessApplicant1Id { get; set; }

    [JsonProperty("process_applicant2_id")]
    public int? ProcessApplicant2Id { get; set; }

    [JsonProperty("start_dispute_status_id")]
    public int StartDisputeStatusId { get; set; }

    [JsonProperty("preparation_duration")]
    public int? PreparationDuration { get; set; }

    [JsonProperty("writing_duration")]
    public int? WritingDuration { get; set; }
}