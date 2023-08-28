using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Hearing
{
    public class OnHoldHearingsGetResponse
    {
        public OnHoldHearingsGetResponse()
        {
            AvailableHearings = new List<OnHoldHearingResponse>();
        }

        [JsonProperty("total_available_records")]
        public int TotalAvailableRecords { get; set; }

        [JsonProperty("available_hearings")]
        public List<OnHoldHearingResponse> AvailableHearings { get; set; }
    }

    public class OnHoldHearingResponse
    {
        [JsonProperty("hearing_id")]
        public int HearingId { get; set; }

        [JsonProperty("hearing_priority")]
        public int HearingPriority { get; set; }

        [JsonProperty("conference_bridge_id")]
        public int? ConferenceBridgeId { get; set; }

        [JsonProperty("hearing_owner")]
        public int? HearingOwner { get; set; }

        [JsonProperty("hearing_start_datetime")]
        public string HearingStartDateTime { get; set; }

        [JsonProperty("hearing_end_datetime")]
        public string HearingEndDateTime { get; set; }

        [JsonProperty("local_start_datetime")]
        public string LocalStartDateTime { get; set; }

        [JsonProperty("local_end_datetime")]
        public string LocalEndDateTime { get; set; }

        [JsonProperty("hearing_reserved_until")]
        public string HearingReservedUntil { get; set; }

        [JsonProperty("hearing_reserved_by_id")]
        public int? HearingReservedById { get; set; }

        [JsonProperty("hearing_reserved_dispute_guid")]
        public Guid? HearingReservedDisputeGuid { get; set; }

        [JsonProperty("hearing_reserved_file_number")]
        public int? HearingReservedFileNumber { get; set; }

        [JsonProperty("conference_type")]
        public byte? ConferenceType { get; set; }
    }
}
