using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Dashboard;

public class UnAssignedHearingsRequest
{
    [JsonProperty("hearing_start_date")]
    public DateTime? HearingStartDate { get; set; }
}