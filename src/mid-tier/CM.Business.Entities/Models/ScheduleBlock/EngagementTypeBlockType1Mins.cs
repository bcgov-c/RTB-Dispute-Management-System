using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ScheduleBlock;

public class EngagementTypeBlockType1Mins
{
    [JsonProperty("1")]
    public int EngagementType1Count { get; set; }

    [JsonProperty("2")]
    public int EngagementType2Count { get; set; }

    [JsonProperty("3")]
    public int EngagementType3Count { get; set; }

    [JsonProperty("4")]
    public int EngagementType4Count { get; set; }
}