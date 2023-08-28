using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Hearing
{
    public class OnHoldHearingsRequest
    {
        [JsonProperty("min_hearing_start_time")]
        public DateTime? MinHearingStartTime { get; set; }

        [JsonProperty("max_hearing_end_time")]
        public DateTime? MaxHearingEndTime { get; set; }

        [JsonProperty("filter_dispute_guid")]
        public Guid? FilterDisputeGuid { get; set; }
    }
}
