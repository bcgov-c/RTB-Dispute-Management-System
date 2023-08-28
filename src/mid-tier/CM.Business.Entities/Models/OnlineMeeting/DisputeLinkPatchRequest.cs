using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OnlineMeeting
{
    public class DisputeLinkPatchRequest
    {
        [JsonProperty("dispute_link_role")]
        public DisputeLinkRole DisputeLinkRole { get; set; }

        [JsonProperty("dispute_link_status")]
        public DisputeLinkStatus DisputeLinkStatus { get; set; }
    }
}
