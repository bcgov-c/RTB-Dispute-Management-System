using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.DisputeHearing
{
    public class ExternalDisputeHearingResponse : CommonResponse
    {
        [JsonProperty("dispute_hearing_id")]
        public int DisputeHearingId { get; set; }

        [JsonProperty("hearing_id")]
        public int HearingId { get; set; }

        [JsonProperty("file_number")]
        public int? FileNumber { get; set; }

        [JsonProperty("dispute_hearing_role")]
        public byte DisputeHearingRole { get; set; }

        [JsonProperty("shared_hearing_link_type")]
        public byte? SharedHearingLinkType { get; set; }
    }
}
