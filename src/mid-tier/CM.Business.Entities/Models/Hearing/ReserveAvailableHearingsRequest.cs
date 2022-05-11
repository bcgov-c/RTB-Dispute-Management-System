using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Hearing;

public class ReserveAvailableHearingsRequest
{
    [JsonProperty("min_hearing_start_time")]
    public DateTime MinHearingStartTime { get; set; }

    [JsonProperty("max_hearing_start_time")]
    public DateTime? MaxHearingStartTime { get; set; }

    [JsonProperty("included_priorities")]
    public int?[] IncludedPriorities { get; set; }

    [JsonProperty("hearings_to_reserve")]
    public int? HearingsToReserve { get; set; }
}