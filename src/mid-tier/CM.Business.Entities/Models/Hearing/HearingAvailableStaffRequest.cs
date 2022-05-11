using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Hearing;

public class HearingAvailableStaffRequest
{
    [JsonProperty("local_start_datetime")]
    public DateTime LocalStartDatetime { get; set; }

    [JsonProperty("local_end_datetime")]
    public DateTime LocalEndDatetime { get; set; }

    [JsonProperty("role_group")]
    public byte RoleGroup { get; set; }

    [JsonProperty("role_subgroup")]
    public byte? RoleSubgroup { get; set; }
}