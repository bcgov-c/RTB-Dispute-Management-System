using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Search;

public class SearchRequestBase
{
    [JsonProperty("submitted_date_greater_than")]
    public DateTime? SubmittedDateGreaterThan { get; set; }

    [JsonProperty("submitted_date_less_than")]
    public DateTime? SubmittedDateLessThan { get; set; }

    [JsonProperty("created_date_greater_than")]
    public DateTime? CreatedDateGreaterThan { get; set; }

    [JsonProperty("created_date_less_than")]
    public DateTime? CreatedDateLessThan { get; set; }

    [JsonProperty("modified_date_greater_than")]
    public DateTime? ModifiedDateGreaterThan { get; set; }

    [JsonProperty("modified_date_less_than")]
    public DateTime? ModifiedDateLessThan { get; set; }

    [JsonProperty("include_not_active")]
    public bool? IncludeNotActive { get; set; }
}