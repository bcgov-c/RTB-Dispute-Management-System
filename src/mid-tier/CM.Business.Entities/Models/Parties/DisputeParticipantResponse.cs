using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Parties;

public class DisputeParticipantResponse : CommonResponse
{
    [JsonProperty("group_participant_id")]
    public int ClaimGroupParticipantId { get; set; }

    [JsonProperty("participant_id")]
    public int ParticipantId { get; set; }

    [JsonProperty("is_deleted")]
    public bool IsDeleted { get; set; }

    [JsonProperty("group_participant_role")]
    public byte GroupParticipantRole { get; set; }

    [JsonProperty("group_primary_contact_id")]
    public int GroupPrimaryContactId { get; set; }
}