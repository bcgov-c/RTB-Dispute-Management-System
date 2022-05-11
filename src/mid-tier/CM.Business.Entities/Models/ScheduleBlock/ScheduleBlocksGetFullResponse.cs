using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ScheduleBlock;

public class ScheduleBlocksGetFullResponse
{
    public ScheduleBlocksGetFullResponse()
    {
        ScheduleBlocks = new List<ScheduleBlockGetResponse>();
    }

    [JsonProperty("total_available_records")]
    public int TotalAvailableRecords { get; set; }

    [JsonProperty("schedule_blocks")]
    public List<ScheduleBlockGetResponse> ScheduleBlocks { get; set; }
}