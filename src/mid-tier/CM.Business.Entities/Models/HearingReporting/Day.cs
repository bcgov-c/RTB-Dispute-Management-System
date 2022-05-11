using System.Collections.Generic;
using CM.Business.Entities.Models.ScheduleBlock;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.HearingReporting;

public class Day
{
    [JsonProperty("date")]
    public string Date { get; set; }

    [JsonProperty("day_hearings")]
    public int DayTotalHearings { get; set; }

    [JsonProperty("day_assigned")]
    public int DayAssignedHearings { get; set; }

    [JsonProperty("day_unassigned")]
    public int DayUnassignedHearings { get; set; }

    [JsonProperty("day_details")]
    public List<DayDetail> DayDetails { get; set; }
}

public class DayReport : Day
{
    [JsonProperty("schedule_blocks")]
    public List<ScheduleBlockPostResponse> ScheduleBlocks { get; set; }

    [JsonProperty("owner_hearings")]
    public List<OwnerHearing> OwnerHearings { get; set; }
}