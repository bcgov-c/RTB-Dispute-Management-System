using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Files;

public class LinkedFileListResponse
{
    public LinkedFileListResponse()
    {
        LinkedFileResponses = new List<LinkedFileResponse>();
    }

    [JsonProperty("total_available_records")]
    public int TotalAvailableRecords { get; set; }

    [JsonProperty("link_files")]
    public List<LinkedFileResponse> LinkedFileResponses { get; set; }
}