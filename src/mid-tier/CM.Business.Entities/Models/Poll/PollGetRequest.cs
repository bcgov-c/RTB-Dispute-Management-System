using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Poll
{
    public class PollGetRequest
    {
        [JsonProperty("poll_statuses")]
        public byte[] PollStatuses { get; set; }

        [JsonProperty("poll_type")]
        public byte? PollType { get; set; }

        [JsonProperty("poll_sites")]
        public byte[] PollSite { get; set; }
    }
}
