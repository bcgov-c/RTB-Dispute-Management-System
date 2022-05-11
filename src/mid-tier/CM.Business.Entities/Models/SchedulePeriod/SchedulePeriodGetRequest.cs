using System;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.SchedulePeriod;

public class SchedulePeriodGetRequest
{
    [JsonProperty("between_schedule_period_id")]
    public int[] BetweenSchedulePeriodId { get; set; }

    [JsonProperty("after_period_ending_date")]
    public DateTime? AfterPeriodEndingDate { get; set; }

    [JsonProperty("before_period_ending_date")]
    public DateTime? BeforePeriodEndingDate { get; set; }

    [JsonProperty("in_period_time_zone")]
    public CmTimeZone? InPeriodTimeZone { get; set; }

    [JsonProperty("contains_period_statuses")]
    public int[] ContainsPeriodStatuses { get; set; }
}