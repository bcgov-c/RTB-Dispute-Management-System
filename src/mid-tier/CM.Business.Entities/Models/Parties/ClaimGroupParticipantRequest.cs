using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Parties;

public class ClaimGroupParticipantRequest
{
    [JsonProperty("participant_id")]
    [Required]
    [Range(1, int.MaxValue)]
    public int ParticipantId { get; set; }

    [JsonProperty("group_participant_role")]
    [Required]
    [Range(1, int.MaxValue)]
    public byte GroupParticipantRole { get; set; }

    [JsonProperty("group_primary_contact_id")]
    public int GroupPrimaryContactId { get; set; }
}