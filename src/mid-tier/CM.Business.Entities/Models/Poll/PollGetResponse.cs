using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Poll
{
    public class PollGetResponse
    {
        public PollGetResponse()
        {
            Polls = new List<PollResponse>();
        }

        [JsonProperty("total_avalable_records")]
        public int TotalCount { get; set; }

        [JsonProperty("polls")]
        public List<PollResponse> Polls { get; set; }
    }
}
