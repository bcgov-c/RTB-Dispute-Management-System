using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OnlineMeeting
{
    public class OnlineMeetingPostRequest
    {
        [JsonProperty("conference_type")]
        public ConferenceType ConferenceType { get; set; }

        [JsonProperty("conference_url")]
        [StringLength(1000, MinimumLength = 10)]
        public string ConferenceUrl { get; set; }

        [JsonProperty("dial_in_number1")]
        [StringLength(20, MinimumLength = 7)]
        public string DialInNumber1 { get; set; }

        [JsonProperty("dial_in_description1")]
        [StringLength(255, MinimumLength = 5)]
        public string DialInDescription1 { get; set; }
    }
}
