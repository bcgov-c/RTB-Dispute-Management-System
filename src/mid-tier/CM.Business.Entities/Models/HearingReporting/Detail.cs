using Newtonsoft.Json;

namespace CM.Business.Entities.Models.HearingReporting;

public class Detail
{
    [JsonProperty("hearing_priority")]
    public byte? HearingPriority { get; set; }

    [JsonProperty("hearings")]
    public int TotalHearingCount { get; set; }

    [JsonProperty("assigned")]
    public int AssignedHearingCount { get; set; }

    [JsonProperty("unassigned")]
    public int UnassignedHearingCount { get; set; }
}