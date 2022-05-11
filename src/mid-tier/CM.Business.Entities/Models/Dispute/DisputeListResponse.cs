using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Dispute;

public class DisputeListResponse
{
    public DisputeListResponse()
    {
        Disputes = new List<DisputeListResponseEntity>();
    }

    [JsonProperty("total_available_records")]
    public int TotalAvailableRecords { get; set; }

    [JsonProperty("disputes")]
    public List<DisputeListResponseEntity> Disputes { get; set; }
}