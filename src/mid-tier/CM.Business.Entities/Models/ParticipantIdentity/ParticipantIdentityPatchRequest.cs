using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ParticipantIdentity
{
    public class ParticipantIdentityPatchRequest
    {
        [JsonProperty("identity_participant_id")]
        [Range(1, int.MaxValue)]
        public int IdentityParticipantId { get; set; }

        [JsonProperty("identity_system_user_id")]
        public int? IdentitySystemUserId { get; set; }

        [JsonProperty("identity_status")]
        public byte? IdentityStatus { get; set; }

        [MaxLength(250)]
        [JsonProperty("identity_note")]
        public string IdentityNote { get; set; }
    }
}
