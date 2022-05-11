using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Search;

public class DisputeStatusOwnerSearchRequest
{
    [JsonProperty("owned_by")]
    public int[] OwnedBy { get; set; }

    [JsonProperty("statuses")]
    public int[] Statuses { get; set; }

    [JsonProperty("stages")]
    public int[] Stages { get; set; }

    [JsonProperty("processes")]
    public int[] Processes { get; set; }

    [JsonProperty("status_start_date_greater_than")]
    public DateTime? StatusStartDateGreaterThan { get; set; }

    [JsonProperty("status_start_date_less_than ")]
    public DateTime? StatusStartDateLessThan { get; set; }
}