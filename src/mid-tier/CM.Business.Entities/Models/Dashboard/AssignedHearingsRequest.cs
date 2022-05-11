using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Dashboard;

public class AssignedHearingsRequest
{
    [JsonProperty("return_hearings_after_date")]
    public DateTime? ReturnHearingsAfterDate { get; set; }
}