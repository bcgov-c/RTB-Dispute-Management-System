using System;
using CM.Business.Entities.Models.Base;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OnlineMeeting
{
    public class DisputeLinkResponse : CommonResponse
    {
        [JsonProperty("dispute_link_id")]
        public int DisputeLinkId { get; set; }

        [JsonProperty("dispute_guid")]
        public Guid DisputeGuid { get; set; }

        [JsonProperty("online_meeting_id")]
        public int OnlineMeetingId { get; set; }

        [JsonProperty("dispute_link_role")]
        public DisputeLinkRole DisputeLinkRole { get; set; }

        [JsonProperty("dispute_link_type")]
        public DisputeLinkType DisputeLinkType { get; set; }

        [JsonProperty("dispute_link_status")]
        public DisputeLinkStatus DisputeLinkStatus { get; set; }
    }
}
