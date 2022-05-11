using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.HearingReporting;

public class ScheduleBlockResponse
{
    [JsonProperty("schedule_block_id")]
    public int ScheduleBlockId { get; set; }

    [JsonProperty("schedule_period_id")]
    public int SchedulePeriodId { get; set; }

    [JsonProperty("block_start")]
    public string BlockStart { get; set; }

    [JsonProperty("block_end")]
    public string BlockEnd { get; set; }

    [JsonProperty("block_type")]
    public BlockType? BlockType { get; set; }

    [JsonProperty("block_status")]
    public BlockStatus? BlockStatus { get; set; }

    [JsonProperty("block_sub_status")]
    public BlockSubStatus? BlockSubStatus { get; set; }

    [JsonProperty("block_description")]
    public string BlockDescription { get; set; }
}