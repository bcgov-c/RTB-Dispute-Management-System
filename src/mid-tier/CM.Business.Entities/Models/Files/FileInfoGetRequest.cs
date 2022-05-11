using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Files;

public class FileInfoGetRequest
{
    [JsonProperty("file_types")]
    public int[] FileTypes { get; set; }
}