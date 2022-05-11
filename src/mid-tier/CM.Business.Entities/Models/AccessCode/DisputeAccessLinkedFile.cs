using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AccessCode;

public class DisputeAccessLinkedFile
{
    [JsonProperty("file_type")]
    public byte FileType { get; set; }

    [JsonProperty("file_mime_type")]
    public string FileMimeType { get; set; }

    [JsonProperty("file_status")]
    public byte? FileStatus { get; set; }

    [JsonProperty("file_package_id")]
    public int? FilePackageId { get; set; }

    [JsonProperty("file_package_type")]
    public byte? FilePackageType { get; set; }

    [JsonProperty("added_by")]
    public int? AddedBy { get; set; }

    [JsonProperty("created_date")]
    public string CreatedDate { get; set; }
}