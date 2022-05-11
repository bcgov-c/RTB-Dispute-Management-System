using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AccessCode
{
    public class DisputeAccessHearingParticipation
    {
        [JsonProperty("hearing_participation_id")]
        public int HearingParticipationId { get; set; }

        [JsonProperty("participant_id")]
        public int? ParticipantId { get; set; }

        [JsonProperty("participation_status")]
        public byte? ParticipationStatus { get; set; }

        [JsonProperty("pre_participation_status")]
        public byte? PreParticipationStatus { get; set; }

        [JsonProperty("created_date")]
        public string CreatedDate { get; set; }

        [JsonProperty("modified_date")]
        public string ModifiedDate { get; set; }
    }
}
