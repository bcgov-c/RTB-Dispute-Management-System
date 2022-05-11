using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ScheduleBlock;

public class ScheduleBlockGetByDateRangeRequest
{
    [JsonProperty("block_starting_after")]
    public DateTime BlockStartingAfter { get; set; }

    [JsonProperty("block_starting_before")]
    public DateTime BlockStartingBefore { get; set; }

    [JsonProperty("system_user_id")]
    public int? SystemUserId { get; set; }
}