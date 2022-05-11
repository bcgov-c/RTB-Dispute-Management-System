using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Search;

public class ClaimsSearchRequest : SearchRequestBaseWithFilters
{
    [JsonProperty("claim_codes")]
    public int[] ClaimCodes { get; set; }

    [JsonProperty("creation_method")]
    public byte? CreationMethod { get; set; }
}