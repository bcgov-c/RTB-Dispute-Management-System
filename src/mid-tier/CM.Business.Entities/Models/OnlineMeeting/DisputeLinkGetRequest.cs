using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OnlineMeeting
{
    public class DisputeLinkGetRequest
    {
        [JsonProperty("dispute_link_status")]
        public DisputeLinkStatus? DisputeLinkStatus { get; set; }
    }
}
