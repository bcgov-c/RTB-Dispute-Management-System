using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ExternalUpdate
{
    public class ExternalHearingWaitTimeRequest
    {
        [JsonProperty("hearing_priority")]
        [Range(1, 4, ErrorMessage = "A valid hearing urgency is required")]
        public byte HearingPriority { get; set; }

        [JsonProperty("notice_interval")]
        [Range(1, 30, ErrorMessage = "A valid notice_interval between 1-30 is required")]
        public byte NoticeInterval { get; set; }

        [JsonProperty("avg_set_size")]
        [Range(1, 30, ErrorMessage = "A valid avg_set_size between 1-30 is required")]
        public byte AvgSetSize { get; set; }
    }
}
