using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Search;

public class AccessCodeSearchRequest
{
    [JsonProperty("access_code")]
    public string AccessCode { get; set; }
}