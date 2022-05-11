using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OfficeUser;

public class OfficeUserGetDisputeRequest
{
    [JsonProperty("search_method")]
    public byte SearchMethod { get; set; }

    [JsonProperty("file_number")]
    public int FileNumber { get; set; }

    [JsonProperty("participant_access_code")]
    public string AccessCode { get; set; }
}