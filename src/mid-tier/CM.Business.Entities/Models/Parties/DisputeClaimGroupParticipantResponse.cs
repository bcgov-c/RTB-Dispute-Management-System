using System.Collections.Generic;

namespace CM.Business.Entities.Models.Parties;

public class DisputeClaimGroupParticipantResponse
{
    public DisputeClaimGroupParticipantResponse()
    {
        Participants = new List<DisputeParticipantResponse>();
    }

    public int ClaimGroupId { get; set; }

    public List<DisputeParticipantResponse> Participants { get; set; }
}