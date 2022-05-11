using Newtonsoft.Json;

namespace CM.Business.Entities.Models.SchedulePeriod;

public class SchedulePeriodGetResponse : SchedulePeriodPostResponse
{
    [JsonProperty("associated_schedule_blocks")]
    public int AssociatedScheduleBlocks { get; set; }

    [JsonProperty("associated_hearings")]
    public int AssociatedHearings { get; set; }
}