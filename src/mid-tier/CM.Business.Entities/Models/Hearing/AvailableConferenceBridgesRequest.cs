using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Hearing;

public class AvailableConferenceBridgesRequest
{
    [JsonProperty("local_start_datetime")]
    public DateTime LocalStartDatetime { get; set; }

    [JsonProperty("local_end_datetime")]
    public DateTime LocalEndDatetime { get; set; }
}