using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AccessCode;

public class DisputeAccessClaimGroup
{
    public DisputeAccessClaimGroup()
    {
        Participants = new List<DisputeAccessParticipant>();
    }

    [JsonProperty("claim_group_id")]
    public int ClaimGroupId { get; set; }

    [JsonProperty("participants")]
    public List<DisputeAccessParticipant> Participants { get; set; }
}