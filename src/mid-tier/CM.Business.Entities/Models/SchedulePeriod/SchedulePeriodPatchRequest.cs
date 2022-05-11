using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.SchedulePeriod;

public class SchedulePeriodPatchRequest
{
    [JsonProperty("period_status")]
    public PeriodStatus PeriodStatus { get; set; }
}