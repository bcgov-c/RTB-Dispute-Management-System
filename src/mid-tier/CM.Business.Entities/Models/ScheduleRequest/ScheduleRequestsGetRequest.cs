using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ScheduleRequest;

public class ScheduleRequestsGetRequest
{
    [JsonProperty("request_type")]
    public int[] RequestType { get; set; }

    [JsonProperty("request_status_in")]
    public int[] StatusIn { get; set; }

    [JsonProperty("request_start_after")]
    public DateTime? RequestStartAfter { get; set; }

    [JsonProperty("request_ends_before")]
    public DateTime? RequestEndBefore { get; set; }

    [JsonProperty("request_end_after")]
    public DateTime? RequestEndAfter { get; set; }

    [JsonProperty("request_submitters")]
    public int[] RequestSubmitters { get; set; }

    [JsonProperty("request_owners")]
    public int[] RequestOwners { get; set; }
}