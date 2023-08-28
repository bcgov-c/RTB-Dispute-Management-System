using System;
using System.ComponentModel.DataAnnotations;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Dispute
{
    public class DisputeUserGetResponse : CommonResponse
    {
        [JsonProperty("dispute_user_id")]
        public int DisputeUserId { get; set; }

        [JsonProperty("dispute_guid")]
        public Guid DisputeGuid { get; set; }

        [JsonProperty("system_user_id")]
        public int SystemUserId { get; set; }

        [JsonProperty("is_active")]
        public bool IsActive { get; set; }

        [JsonProperty("system_user_role_id")]
        public int SystemUserRoleId { get; set; }

        [JsonProperty("participant_id")]
        public int? ParticipantId { get; set; }

        [JsonProperty("user_name")]
        public string Username { get; set; }

        [JsonProperty("full_name")]
        public string FullName { get; set; }
    }
}
