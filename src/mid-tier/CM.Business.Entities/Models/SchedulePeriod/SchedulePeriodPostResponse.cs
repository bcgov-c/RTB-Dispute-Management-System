using CM.Business.Entities.Models.Base;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.SchedulePeriod;

public class SchedulePeriodPostResponse : CommonResponse
{
    [JsonProperty("schedule_period_id")]
    public int SchedulePeriodId { get; set; }

    [JsonProperty("period_time_zone")]
    public CmTimeZone PeriodTimeZone { get; set; }

    [JsonProperty("period_start")]
    public string PeriodStart { get; set; }

    [JsonProperty("period_end")]
    public string PeriodEnd { get; set; }

    [JsonProperty("local_period_start")]
    public string LocalPeriodStart { get; set; }

    [JsonProperty("local_period_end")]
    public string LocalPeriodEnd { get; set; }

    [JsonProperty("period_status")]
    public PeriodStatus PeriodStatus { get; set; }
}