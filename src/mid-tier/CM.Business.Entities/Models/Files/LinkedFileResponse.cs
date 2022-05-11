using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Files;

public class LinkedFileResponse : CommonResponse
{
    [JsonProperty("link_file_id")]
    public int LinkedFileId { get; set; }

    [JsonProperty("file_id")]
    public int FileId { get; set; }

    [JsonProperty("file_description_id")]
    public int FileDescriptionId { get; set; }

    [JsonProperty("accepted")]
    public bool? Accepted { get; set; }
}