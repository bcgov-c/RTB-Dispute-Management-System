using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Hearing;

public class AvailableStaffResponse
{
    [JsonProperty("user_id")]
    public int UserId { get; set; }

    [JsonProperty("full_name")]
    public string FullName { get; set; }

    [JsonProperty("same_day_hearings")]
    public List<SameDayHearing> SameDayHearings { get; set; }

    [JsonProperty("user_name")]
    public string Username { get; set; }
}

public class SameDayHearing
{
    [JsonProperty("hearing_id")]
    public int HearingId { get; set; }

    [JsonProperty("hearing_start_datetime")]
    public string HearingStartDateTime { get; set; }

    [JsonProperty("hearing_end_datetime")]
    public string HearingEndDateTime { get; set; }

    [JsonProperty("local_start_datetime")]
    public DateTime LocalStartDateTime { get; set; }

    [JsonProperty("local_end_datetime")]
    public DateTime LocalEndDateTime { get; set; }
}