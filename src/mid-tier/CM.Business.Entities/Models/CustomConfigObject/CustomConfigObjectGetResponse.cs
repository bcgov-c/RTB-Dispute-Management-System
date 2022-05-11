using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.CustomConfigObject;

public class CustomConfigObjectGetResponse
{
    public CustomConfigObjectGetResponse()
    {
        CustomConfigObjects = new List<CustomConfigObjectResponse>();
    }

    [JsonProperty("total_available_records")]
    public int TotalAvailableRecords { get; set; }

    [JsonProperty("custom_config_objects")]
    public List<CustomConfigObjectResponse> CustomConfigObjects { get; set; }
}