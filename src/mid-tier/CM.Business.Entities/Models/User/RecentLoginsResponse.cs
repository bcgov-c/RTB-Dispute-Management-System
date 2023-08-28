using Newtonsoft.Json;

namespace CM.Business.Entities.Models.User
{
    public class RecentLoginsResponse
    {
        [JsonProperty("issued_on")]
        public string IssuedOn { get; set; }
    }
}
