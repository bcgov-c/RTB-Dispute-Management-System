using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OfficeUser;

public class OfficeUserClaimGroup
{
    [JsonProperty("claim_group_id")]
    public int ClaimGroupId { get; set; }
}

public class OfficeUserGetDisputeClaimGroup : OfficeUserClaimGroup
{
    public OfficeUserGetDisputeClaimGroup()
    {
        Participants = new List<OfficeUserGetDisputeParticipant>();
    }

    [JsonProperty("participants")]
    public ICollection<OfficeUserGetDisputeParticipant> Participants { get; set; }
}

public class OfficeUserPostDisputeClaimGroup : OfficeUserClaimGroup
{
    public OfficeUserPostDisputeClaimGroup()
    {
        Participants = new List<OfficeUserPostDisputeParticipantResponse>();
    }

    [JsonProperty("participants")]
    public ICollection<OfficeUserPostDisputeParticipantResponse> Participants { get; set; }
}