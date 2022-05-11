using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.HearingReporting;

public class Year
{
    [JsonProperty("year")]
    public int HearingYear { get; set; }

    [JsonProperty("year_hearings")]
    public int YearTotalHearings { get; set; }

    [JsonProperty("year_assigned")]
    public int YearAssignedHearings { get; set; }

    [JsonProperty("year_unassigned")]
    public int YearUnassignedHearings { get; set; }

    [JsonProperty("year_details")]
    public List<YearDetail> YearDetails { get; set; }

    [JsonProperty("month_breakdown")]
    public List<Month> Months { get; set; }
}