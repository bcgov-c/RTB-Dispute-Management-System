using System;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Parties;

public class ClaimGroupResponse : CommonResponse
{
    [JsonProperty("claim_group_id")]
    public int ClaimGroupId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }
}