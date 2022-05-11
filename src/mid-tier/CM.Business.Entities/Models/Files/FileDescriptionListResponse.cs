using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Files;

public class FileDescriptionListResponse
{
    [JsonProperty("total_available_count")]
    public int TotalAvailableCount { get; set; }

    [JsonProperty("file_descriptions")]
    public List<FileDescriptionResponse> FileDescriptionResponses { get; set; }
}