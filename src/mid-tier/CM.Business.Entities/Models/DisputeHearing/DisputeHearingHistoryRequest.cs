using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.DisputeHearing;

public class DisputeHearingHistoryRequest
{
    [JsonProperty("search_type")]
    public byte SearchType { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid? DisputeGuid { get; set; }

    [JsonProperty("hearing_id")]
    public int? HearingId { get; set; }
}