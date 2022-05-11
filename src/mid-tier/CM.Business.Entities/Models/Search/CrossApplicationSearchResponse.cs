using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Search;

public class CrossApplicationSearchResponse : SearchResponse
{
    [JsonProperty("cross_score")]
    public int Score { get; set; }
}