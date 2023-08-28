using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.HearingReporting;

public class AvailableHearingsRequest
{
    [JsonProperty("min_hearing_start_time")]
    public DateTime MinStartDate { get; set; }

    [JsonProperty("max_hearing_start_time")]
    public DateTime? MaxStartDate { get; set; }

    [JsonProperty("included_priorities")]
    public int[] IncludedPriorities { get; set; }

    [JsonProperty("included_owner_id")]
    public int? IncludedOwnerId { get; set; }

    [JsonProperty("included_owner_role_subtype_id")]
    public int[] IncludedOwnerRoleSubtypeId { get; set; }

    [JsonProperty("included_bridge_id")]
    public int? IncludedBridgeId { get; set; }
}