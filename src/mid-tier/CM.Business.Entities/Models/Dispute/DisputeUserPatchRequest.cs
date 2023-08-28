using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Dispute
{
    public class DisputeUserPatchRequest
    {
        [JsonProperty("is_active")]
        public bool IsActive { get; set; }
    }
}
