using System;
using System.ComponentModel.DataAnnotations;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ParticipantIdentity
{
    public class ParticipantIdentityResponse : CommonResponse
    {
        [JsonProperty("participant_identity_id")]
        public int ParticipantIdentityId { get; set; }

        [JsonProperty("participant_id")]
        public int ParticipantId { get; set; }

        [JsonProperty("dispute_guid")]
        public Guid DisputeGuid { get; set; }

        [JsonProperty("file_number")]
        public int? FileNumber { get; set; }

        [JsonProperty("identity_participant_id")]
        public int IdentityParticipantId { get; set; }

        [JsonProperty("identity_dispute_guid")]
        public Guid IdentityDisputeGuid { get; set; }

        [JsonProperty("identity_file_number")]
        public int? IdentityFileNumber { get; set; }

        [JsonProperty("identity_system_user_id")]
        public int? IdentitySystemUserId { get; set; }

        [JsonProperty("identity_status")]
        public byte? IdentityStatus { get; set; }

        [MaxLength(250)]
        [JsonProperty("identity_note")]
        public string IdentityNote { get; set; }
    }
}
