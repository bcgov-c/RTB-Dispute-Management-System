using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OfficeUser
{
    public class ExternalHearingParticipationRequest
    {
        [JsonProperty("pre_participation_status")]
        public byte PreParticipationStatus { get; set; }

        [JsonProperty("pre_participation_comment")]
        [StringLength(1000)]
        public string PreParticipationComment { get; set; }

        [JsonProperty("participation_status_by")]
        public int? ParticipationStatusBy { get; set; }

        [JsonProperty("pre_participation_status_by")]
        public int? PreParticipationStatusBy { get; set; }

        [JsonProperty("pre_participation_status_date")]
        public DateTime? PreParticipationStatusDate { get; set; }
    }
}
