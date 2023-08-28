using System;
using CM.Business.Entities.Models.Base;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Poll
{
    public class PollResponse : CommonResponse
    {
        [JsonProperty("poll_id")]
        public int PollId { get; set; }

        [JsonProperty("poll_title")]
        public string PollTitle { get; set; }

        [JsonProperty("poll_description")]
        public string PollDescription { get; set; }

        [JsonProperty("poll_start_date")]
        public string PollStartDate { get; set; }

        [JsonProperty("poll_end_date")]
        public string PollEndDate { get; set; }

        [JsonProperty("poll_status")]
        public PollStatus? PollStatus { get; set; }

        [JsonProperty("poll_type")]
        public byte PollType { get; set; }

        [JsonProperty("poll_site")]
        public PollSite? PollSite { get; set; }

        [JsonProperty("poll_audience")]
        public PollAudience? PollAudience { get; set; }

        [JsonProperty("poll_dispute_type")]
        public DisputeType? PollDisputeType { get; set; }

        [JsonProperty("poll_dispute_subtype")]
        public DisputeSubType? PollDisputeSubType { get; set; }

        [JsonProperty("poll_participant_type")]
        public ParticipantType? PollParticipantType { get; set; }

        [JsonProperty("poll_configuration")]
        public string PollConfiguration { get; set; }

        [JsonProperty("min_reponses")]
        public int? MinResponses { get; set; }

        [JsonProperty("max_responses")]
        public int? MaxResponses { get; set; }
    }
}
