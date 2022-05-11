using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Hearing;

public class AvailableConferenceBridgesResponse
{
    [JsonProperty("bridge_id")]
    public int BridgeId { get; set; }

    [JsonProperty("bridge_type")]
    public byte? BridgeType { get; set; }

    [JsonProperty("preferred_start_time")]
    public DateTime? PreferredStartTime { get; set; }

    [JsonProperty("preferred_owner")]
    public int? PreferredOwner { get; set; }

    [JsonProperty("same_day_hearings")]
    public List<SameDayHearing> SameDayHearings { get; set; }
}