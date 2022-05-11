using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OutcomeDocument;

public class OutcomeDocDeliveryGetRequest
{
    [JsonProperty("delivery_method")]
    public string DeliveryMethod { get; set; }

    [JsonProperty("delivery_priority")]
    public string DeliveryPriority { get; set; }

    [JsonProperty("file_type")]
    public string FileType { get; set; }
}