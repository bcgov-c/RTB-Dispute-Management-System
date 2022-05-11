using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.CmsArchive;

public class CmsArchiveSearchBase
{
    [JsonProperty("submitted_date_greater_than")]
    public DateTime? SubmittedDateGreaterThan { get; set; }

    [JsonProperty("submitted_date_less_than")]
    public DateTime? SubmittedDateLessThan { get; set; }

    [JsonProperty("created_date_greater_than")]
    public DateTime? CreatedDateGreaterThan { get; set; }

    [JsonProperty("created_date_less_than")]
    public DateTime? CreatedDateLessThan { get; set; }

    [JsonProperty("last_modified_date_greater_than")]
    public DateTime? LastModifiedDateGreaterThan { get; set; }

    [JsonProperty("last_modified_date_less_than")]
    public DateTime? LastModifiedDateLessThan { get; set; }

    [JsonProperty("dispute_status_equals")]
    public int? DisputeStatusEquals { get; set; }
}