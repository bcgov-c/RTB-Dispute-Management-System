using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ExternalCustomDataObject;

public class ExternalCustomDataObjectGetResponse
{
    public ExternalCustomDataObjectGetResponse()
    {
        ExternalCustomDataObjects = new List<ExternalCustomDataObjectResponse>();
    }

    [JsonProperty("total_available_records")]
    public int TotalAvailableRecords { get; set; }

    [JsonProperty("external_custom_data_objects")]
    public List<ExternalCustomDataObjectResponse> ExternalCustomDataObjects { get; set; }
}