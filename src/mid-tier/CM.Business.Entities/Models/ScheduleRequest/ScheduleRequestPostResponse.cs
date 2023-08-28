using CM.Business.Entities.Models.Base;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ScheduleRequest;

public class ScheduleRequestPostResponse : CommonResponse
{
    [JsonProperty("schedule_request_id")]
    public int ScheduleRequestId { get; set; }

    [JsonProperty("requestor_system_user_id")]
    public int RequestorSystemUserId { get; set; }

    [JsonProperty("request_type")]
    public byte? RequestType { get; set; }

    [JsonProperty("request_submitter")]
    public int? RequestSubmitter { get; set; }

    [JsonProperty("request_owner")]
    public int? RequestOwnerId { get; set; }

    [JsonProperty("request_start")]
    public string RequestStart { get; set; }

    [JsonProperty("request_end")]
    public string RequestEnd { get; set; }

    [JsonProperty("request_status")]
    public ScheduleRequestStatus? RequestStatus { get; set; }

    [JsonProperty("request_sub_status")]
    public ScheduleRequestSubStatus? RequestSubStatus { get; set; }

    [JsonProperty("request_description")]
    public string RequestDescription { get; set; }

    [JsonProperty("request_note")]
    public string RequestNote { get; set; }

    [JsonProperty("request_json")]
    public string RequestJson { get; set; }
}