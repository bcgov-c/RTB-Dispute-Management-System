using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Hearing;

public class ReassignRequest
{
    [JsonProperty("first_hearing_id")]
    public int FirstHearingId { get; set; }

    [JsonProperty("second_hearing_id")]
    public int SecondHearingId { get; set; }
}