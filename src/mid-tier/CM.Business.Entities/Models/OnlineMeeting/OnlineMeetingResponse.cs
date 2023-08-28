using CM.Business.Entities.Models.Base;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OnlineMeeting
{
    public class OnlineMeetingResponse : CommonResponse
    {
        [JsonProperty("online_conference_id")]
        public int OnlineMeetingId { get; set; }

        [JsonProperty("conference_type")]
        public ConferenceType ConferenceType { get; set; }

        [JsonProperty("conference_status")]
        public byte? ConferenceStatus { get; set; }

        [JsonProperty("conference_id")]
        public string ConferenceId { get; set; }

        [JsonProperty("conference_password")]
        public string ConferencePassword { get; set; }

        [JsonProperty("general_instructions")]
        public string GeneralInstructions { get; set; }

        [JsonProperty("special_instructions")]
        public string SpecialInstructions { get; set; }

        [JsonProperty("conference_url")]
        public string ConferenceUrl { get; set; }

        [JsonProperty("dial_in_number1")]
        public string DialInNumber1 { get; set; }

        [JsonProperty("dial_in_description1")]
        public string DialInDescription1 { get; set; }

        [JsonProperty("dial_in_number2")]
        public string DialInNumber2 { get; set; }

        [JsonProperty("dial_in_description2")]
        public string DialInDescription2 { get; set; }

        [JsonProperty("dial_in_number3")]
        public string DialInNumber3 { get; set; }

        [JsonProperty("dial_in_description3")]
        public string DialInDescription3 { get; set; }
    }
}
