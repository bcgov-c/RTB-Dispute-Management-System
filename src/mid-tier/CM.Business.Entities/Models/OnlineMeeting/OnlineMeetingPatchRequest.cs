using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OnlineMeeting
{
    public class OnlineMeetingPatchRequest
    {
        [JsonProperty("conference_type")]
        public ConferenceType ConferenceType { get; set; }

        [JsonProperty("conference_status")]
        public byte? ConferenceStatus { get; set; }

        [JsonProperty("conference_id")]
        [MinLength(2)]
        public string ConferenceId { get; set; }

        [JsonProperty("conference_password")]
        [MinLength(5)]
        public string ConferencePassword { get; set; }

        [JsonProperty("general_instructions")]
        [MinLength(5)]
        public string GeneralInstructions { get; set; }

        [JsonProperty("special_instructions")]
        [MinLength(5)]
        public string SpecialInstructions { get; set; }

        [JsonProperty("conference_url")]
        [MinLength(10)]
        public string ConferenceUrl { get; set; }

        [JsonProperty("dial_in_number1")]
        [MinLength(7)]
        public string DialInNumber1 { get; set; }

        [JsonProperty("dial_in_description1")]
        [MinLength(5)]
        public string DialInDescription1 { get; set; }

        [JsonProperty("dial_in_number2")]
        [MinLength(7)]
        public string DialInNumber2 { get; set; }

        [JsonProperty("dial_in_description2")]
        [MinLength(5)]
        public string DialInDescription2 { get; set; }

        [JsonProperty("dial_in_number3")]
        [MinLength(7)]
        public string DialInNumber3 { get; set; }

        [JsonProperty("dial_in_description3")]
        [MinLength(5)]
        public string DialInDescription3 { get; set; }
    }
}
