using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ScheduleBlock;

public class ScheduleBlockGetResponse : ScheduleBlockPostResponse
{
    [JsonProperty("associated_hearings")]
    public int AssociatedHearings { get; set; }
}