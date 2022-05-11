using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.HearingReporting;

public class OwnerHearing
{
    [JsonProperty("user_id")]
    public int UserId { get; set; }

    [JsonProperty("full_name")]
    public string FullName { get; set; }

    [JsonProperty("hearings")]
    public List<HearingReport> Hearings { get; set; }
}