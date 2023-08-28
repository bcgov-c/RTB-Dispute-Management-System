using CM.Business.Entities.Models.Base;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ScheduleBlock;

public class ScheduleBlockPostResponse : CommonResponse
{
    [JsonProperty("schedule_block_id")]
    public int ScheduleBlockId { get; set; }

    [JsonProperty("schedule_period_id")]
    public int SchedulePeriodId { get; set; }

    [JsonProperty("system_user_id")]
    public int SystemUserId { get; set; }

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

    [JsonProperty("block_note")]
    public string BlockNote { get; set; }

    [JsonProperty("associated_hearings")]
    public int AssociatedHearings { get; set; }
}