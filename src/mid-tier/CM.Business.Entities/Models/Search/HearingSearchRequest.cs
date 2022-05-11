using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Search;

public class HearingSearchRequest : SearchRequestBaseWithFilters
{
    [JsonProperty("hearing_start")]
    public DateTime? HearingStart { get; set; }

    [JsonProperty("hearing_type")]
    public byte? HearingType { get; set; }

    [JsonProperty("hearing_owner")]
    public int? HearingOwner { get; set; }

    [JsonProperty("hearing_status")]
    public byte? HearingStatus { get; set; }

    [JsonProperty("creation_method")]
    public byte? CreationMethod { get; set; }
}