using System.Collections.Generic;
using CM.Business.Entities.Models.ScheduleBlock;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.HearingReporting;

public class OwnerHearingsResponse
{
    public OwnerHearingsResponse()
    {
        DailyHearings = new List<DailyHearingResponse>();
    }

    [JsonProperty("user_id")]
    public int UserId { get; set; }

    [JsonProperty("full_name")]
    public string FullName { get; set; }

    [JsonProperty("total_assigned")]
    public int TotalAssigned { get; set; }

    [JsonProperty("total_unassigned")]
    public int TotalUnassigned { get; set; }

    [JsonProperty("daily_hearings")]
    public List<DailyHearingResponse> DailyHearings { get; set; }

    [JsonProperty("schedule_blocks")]
    public List<ScheduleBlockPostResponse> ScheduleBlocks { get; set; }
}

public class DailyHearingResponse
{
    public DailyHearingResponse()
    {
        Hearings = new List<HearingReport>();
    }

    [JsonProperty("date")]
    public string Date { get; set; }

    [JsonProperty("hearings")]
    public List<HearingReport> Hearings { get; set; }
}