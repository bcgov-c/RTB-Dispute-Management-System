using Newtonsoft.Json;

namespace CM.Business.Entities.Models.CustomConfigObject;

public class CustomConfigObjectGetRequest
{
    [JsonProperty("request_active_only")]
    public bool RequestActiveOnly { get; set; }

    [JsonProperty("request_object_types")]
    public byte?[] RequestObjectTypes { get; set; }

    [JsonProperty("request_object_statuses")]
    public byte?[] RequestObjectStatuses { get; set; }

    [JsonProperty("request_object_storage_types")]
    public byte?[] RequestObjectStorageTypes { get; set; }
}