using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.HearingReporting;

public class Month
{
    [JsonProperty("month")]
    public string HearingMonth { get; set; }

    [JsonProperty("month_hearings")]
    public int MonthTotalHearings { get; set; }

    [JsonProperty("month_assigned")]
    public int MonthAssignedHearings { get; set; }

    [JsonProperty("month_unassigned")]
    public int MonthUnassignedHearings { get; set; }

    [JsonProperty("month_details")]
    public List<MonthDetail> MonthDetails { get; set; }
}

public class MonthlyReport : Month
{
    [JsonProperty("day_breakdown")]
    public List<Day> Days { get; set; }
}