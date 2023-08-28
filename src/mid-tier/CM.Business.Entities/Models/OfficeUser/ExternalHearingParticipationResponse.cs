using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OfficeUser
{
    public class ExternalHearingParticipationResponse : CommonResponse
    {
        [JsonProperty("hearing_participation_id")]
        public int HearingParticipationId { get; set; }

        [JsonProperty("hearing_id")]
        public int HearingId { get; set; }

        [JsonProperty("participant_id")]
        public int ParticipantId { get; set; }

        [JsonProperty("pre_participation_status")]
        public byte PreParticipationStatus { get; set; }

        [JsonProperty("pre_participation_comment")]
        public string PreParticipationComment { get; set; }

        [JsonProperty("participation_status_by")]
        public int? ParticipationStatusBy { get; set; }

        [JsonProperty("pre_participation_status_by")]
        public int? PreParticipationStatusBy { get; set; }

        [JsonProperty("pre_participation_status_date")]
        public string PreParticipationStatusDate { get; set; }
    }
}
