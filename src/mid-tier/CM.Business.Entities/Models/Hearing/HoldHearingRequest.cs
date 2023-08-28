using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Hearing
{
    public class HoldHearingRequest
    {
        [JsonProperty("hearing_reserved_dispute_guid")]
        public Guid? HearingReservedDisputeGuid { get; set; }

        [JsonProperty("hearing_reserved_until")]
        public DateTime? HearingReservedUntil { get; set; }
    }
}