using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.SchedulePeriod;

public class SchedulePeriodPostRequest
{
    [JsonProperty("period_time_zone")]
    public CmTimeZone PeriodTimeZone { get; set; }
}