using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AccessCode;

public class DisputeOutcomeDocRequestsResponse
{
    [JsonProperty("outcome_doc_request_id")]
    public int OutcomeDocRequestId { get; set; }

    [JsonProperty("outcome_doc_group_id")]
    public int? OutcomeDocGroupId { get; set; }

    [JsonProperty("request_type")]
    public OutcomeDocRequestType RequestType { get; set; }

    [JsonProperty("request_sub_type")]
    public OutcomeDocRequestSubType? RequestSubType { get; set; }

    [JsonProperty("submitter_id")]
    public int SubmitterId { get; set; }

    [JsonProperty("request_date")]
    public string RequestDate { get; set; }

    [JsonProperty("request_status")]
    public int? RequestStatus { get; set; }
}