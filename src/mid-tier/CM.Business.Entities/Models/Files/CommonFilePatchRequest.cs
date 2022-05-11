using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Files;

public class CommonFilePatchRequest
{
    [JsonProperty("file_type")]
    public CommonFileType FileType { get; set; }

    [JsonProperty("file_name")]
    public string FileName { get; set; }

    [JsonProperty("file_title")]
    public string FileTitle { get; set; }

    [JsonProperty("file_description")]
    public string FileDescription { get; set; }
}