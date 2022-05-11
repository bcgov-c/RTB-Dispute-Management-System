using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Files;

public class DisputeFileInfoResponse
{
    public DisputeFileInfoResponse()
    {
        FileInfoResponses = new List<FileInfoResponse>();
    }

    [JsonProperty("total_available_records")]
    public int TotalAvailableRecords { get; set; }

    [JsonProperty("files")]
    public List<FileInfoResponse> FileInfoResponses { get; set; }
}