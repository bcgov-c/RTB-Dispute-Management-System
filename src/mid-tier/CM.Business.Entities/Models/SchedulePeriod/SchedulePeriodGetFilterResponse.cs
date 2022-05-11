using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.SchedulePeriod;

public class SchedulePeriodGetFilterResponse
{
    public SchedulePeriodGetFilterResponse()
    {
        Periods = new List<SchedulePeriodGetResponse>();
    }

    [JsonProperty("total_available_records")]
    public int TotalAvailableRecords { get; set; }

    [JsonProperty("periods")]
    public List<SchedulePeriodGetResponse> Periods { get; set; }
}