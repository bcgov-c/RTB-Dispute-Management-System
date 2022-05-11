using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Search;

public class DisputeDocumentOwnerSearchRequest
{
    [JsonProperty("owned_by")]
    public int[] OwnedBy { get; set; }

    [JsonProperty("file_type")]
    public int[] FileType { get; set; }

    [JsonProperty("has_file_id")]
    public bool? HasFileId { get; set; }

    [JsonProperty("created_date_greater_than")]
    public DateTime? CreatedDateGreaterThan { get; set; }

    [JsonProperty("created_date_less_than")]
    public DateTime? CreatedDateLessThan { get; set; }
}