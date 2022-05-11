using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Files;

public class LinkedFileRequest
{
    [JsonProperty("file_id")]
    public int FileId { get; set; }

    [JsonProperty("file_description_id")]
    public int FileDescriptionId { get; set; }
}