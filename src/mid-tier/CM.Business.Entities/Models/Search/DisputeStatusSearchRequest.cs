using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Search;

public class DisputeStatusSearchRequest : SearchRequestBaseWithFilters
{
    [JsonProperty("status")]
    public byte? Status { get; set; }

    [JsonProperty("stage")]
    public byte? Stage { get; set; }

    [JsonProperty("owner")]
    public int? Owner { get; set; }

    [JsonProperty("process")]
    public int? Process { get; set; }

    [JsonProperty("creation_method")]
    public int? CreationMethod { get; set; }

    [JsonProperty("include_history")]
    public bool? IncludeHistory { get; set; }
}