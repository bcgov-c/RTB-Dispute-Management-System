using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.NoticeService
{
    public class ExternalNoticeServiceResponse : CommonResponse
    {
        [JsonProperty("notice_service_id")]
        public int NoticeServiceId { get; set; }

        [JsonProperty("notice_id")]
        public int NoticeId { get; set; }

        [JsonProperty("participant_id")]
        public int ParticipantId { get; set; }

        [JsonProperty("is_served")]
        public bool? IsServed { get; set; }

        [JsonProperty("service_method")]
        public byte? ServiceMethod { get; set; }

        [JsonProperty("service_date")]
        public string ServiceDate { get; set; }

        [JsonProperty("service_date_used")]
        public byte? ServiceDateUsed { get; set; }

        [JsonProperty("proof_file_description_id")]
        public int? ProofFileDescriptionId { get; set; }

        [JsonProperty("other_proof_file_description_id")]
        public int? OtherProofFileDescriptionId { get; set; }
    }
}
