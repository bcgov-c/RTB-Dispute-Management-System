using System;
using System.Collections.Generic;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.DisputeHearing
{
    public class ExternalDisputeHearingGetResponse : CommonResponse
    {
        public ExternalDisputeHearingGetResponse()
        {
            AssociatedDisputes = new List<ExternalDisputeHearingResponse>();
        }

        [JsonProperty("hearing_id")]
        public int HearingId { get; set; }

        [JsonProperty("hearing_type")]
        public byte? HearingType { get; set; }

        [JsonProperty("hearing_sub_type")]
        public byte? HearingSubType { get; set; }

        [JsonProperty("notification_file_description_id")]
        public int? NotificationFileDescriptionId { get; set; }

        [JsonProperty("hearing_start_datetime")]
        public string HearingStartDateTime { get; set; }

        [JsonProperty("hearing_end_datetime")]
        public string HearingEndDateTime { get; set; }

        [JsonProperty("local_start_datetime")]
        public DateTime LocalStartDateTime { get; set; }

        [JsonProperty("local_end_datetime")]
        public DateTime LocalEndDateTime { get; set; }

        [JsonProperty("hearing_location")]
        public string HearingLocation { get; set; }

        [JsonProperty("use_special_instructions")]
        public bool? UseSpecialInstructions { get; set; }

        [JsonProperty("special_instructions")]
        public string SpecialInstructions { get; set; }

        [JsonProperty("conference_bridge_id")]
        public int? ConferenceBridgeId { get; set; }

        [JsonProperty("conference_bridge_dial_in_number1")]
        public string DialInNumber1 { get; set; }

        [JsonProperty("conference_bridge_dial_in_description1")]
        public string DialInDescription1 { get; set; }

        [JsonProperty("conference_bridge_dial_in_number2")]
        public string DialInNumber2 { get; set; }

        [JsonProperty("conference_bridge_dial_in_description2")]
        public string DialInDescription2 { get; set; }

        [JsonProperty("conference_bridge_participant_code")]
        public string ParticipantCode { get; set; }

        [JsonProperty("conference_type")]
        public byte? ConferenceType { get; set; }

        [JsonProperty("associated_disputes")]
        public List<ExternalDisputeHearingResponse> AssociatedDisputes { get; set; }
    }
}
