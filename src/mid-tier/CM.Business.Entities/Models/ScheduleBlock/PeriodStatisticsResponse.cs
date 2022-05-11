using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ScheduleBlock;

public class PeriodStatisticsResponse
{
    [JsonProperty("local_day")]
    public List<LocalDay> LocalDays { get; set; }
}