using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Dashboard;

public class DsClaim
{
    [JsonProperty("claim_code")]
    public byte? ClaimCode { get; set; }
}