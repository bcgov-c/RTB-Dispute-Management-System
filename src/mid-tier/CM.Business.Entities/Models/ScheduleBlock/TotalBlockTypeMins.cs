using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ScheduleBlock;

public class TotalBlockTypeMins
{
    [JsonProperty("1")]
    public int BlockType1Count { get; set; }

    [JsonProperty("2")]
    public int BlockType2Count { get; set; }
}