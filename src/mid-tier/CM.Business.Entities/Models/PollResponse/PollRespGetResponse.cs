using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.PollResponse
{
    public class PollRespGetResponse
    {
        public PollRespGetResponse()
        {
            PollResponses = new List<PollRespResponse>();
        }

        [JsonProperty("total_avalable_records")]
        public int TotalCount { get; set; }

        [JsonProperty("pollresponses")]
        public List<PollRespResponse> PollResponses { get; set; }
    }
}
