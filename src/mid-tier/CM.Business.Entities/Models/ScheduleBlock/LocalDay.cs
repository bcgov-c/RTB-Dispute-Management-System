using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ScheduleBlock;

public class LocalDay
{
    [JsonProperty("day_of_week")]
    public string DayOfWeek { get; set; }

    [JsonProperty("total_block_type_mins")]
    public TotalBlockTypeMins TotalBlockTypeMins { get; set; }

    [JsonProperty("engagement_type_block_type1_mins")]
    public EngagementTypeBlockType1Mins EngagementTypeBlockType1Mins { get; set; }
}