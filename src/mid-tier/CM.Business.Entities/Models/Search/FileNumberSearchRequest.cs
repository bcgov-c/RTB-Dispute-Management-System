using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Search;

public class FileNumberSearchRequest
{
    [JsonProperty("file_number")]
    public int FileNumber { get; set; }
}