using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Parties;

public class ClaimGroupParticipantResponse : ClaimGroupParticipantEntity
{
    [JsonProperty("group_participant_id")]
    public int ClaimGroupParticipantId { get; set; }
}