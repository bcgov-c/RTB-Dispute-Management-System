using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AccessCode;

public class DisputeAccessFileDescription
{
    public DisputeAccessFileDescription()
    {
        LinkedFiles = new List<DisputeAccessLinkedFile>();
    }

    [JsonProperty("file_description_id")]
    public int FileDescriptionId { get; set; }

    [JsonProperty("description_category")]
    public byte DescriptionCategory { get; set; }

    [JsonProperty("description_code")]
    public byte? DescriptionCode { get; set; }

    [JsonProperty("description_by")]
    public int? DescriptionBy { get; set; }

    [JsonProperty("is_deficient")]
    public bool IsDeficient { get; set; }

    [JsonProperty("linked_files")]
    public List<DisputeAccessLinkedFile> LinkedFiles { get; set; }
}