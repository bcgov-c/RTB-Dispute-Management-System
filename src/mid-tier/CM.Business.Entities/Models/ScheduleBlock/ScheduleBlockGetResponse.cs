using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ScheduleBlock;

public class ScheduleBlockGetResponse : ScheduleBlockPostResponse
{
    [JsonProperty("assocaited_booked_hearings")]
    public int AssociatedBookedHearings { get; set; }
}