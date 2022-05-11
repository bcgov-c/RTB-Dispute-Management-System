using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ExternalFile;

public class ExternalFilePatchRequest
{
    [JsonProperty("original_file_name")]
    public string OriginalFileName { get; set; }

    [JsonProperty("file_sub_type")]
    public ExternalFileType? FileSubType { get; set; }

    [JsonProperty("file_status")]
    public FileStatus? FileStatus { get; set; }

    [JsonProperty("file_title")]
    public string FileTitle { get; set; }

    [JsonProperty("file_description")]
    public string FileDescription { get; set; }
}