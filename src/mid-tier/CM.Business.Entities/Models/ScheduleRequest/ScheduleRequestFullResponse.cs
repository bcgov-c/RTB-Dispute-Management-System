using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ScheduleRequest;

public class ScheduleRequestFullResponse
{
    public ScheduleRequestFullResponse()
    {
        TotalAvailableRecords = 0;
        ScheduleRequests = new List<ScheduleRequestGetResponse>();
    }

    [JsonProperty("total_available_records")]
    public int TotalAvailableRecords { get; set; }

    [JsonProperty("schedule_requests")]
    public List<ScheduleRequestGetResponse> ScheduleRequests { get; set; }
}