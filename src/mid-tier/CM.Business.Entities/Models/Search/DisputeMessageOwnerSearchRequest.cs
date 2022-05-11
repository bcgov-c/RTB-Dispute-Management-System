using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Search;

public class DisputeMessageOwnerSearchRequest
{
    [JsonProperty("created_by")]
    public int[] CreatedBy { get; set; }

    [JsonProperty("send_statuses")]
    public int[] SendStatuses { get; set; }

    [JsonProperty("message_types")]
    public int[] MessageTypes { get; set; }

    [JsonProperty("template_ids")]
    public int[] TemplateIds { get; set; }

    [JsonProperty("created_date_greater_than")]
    public DateTime? CreatedDateGreaterThan { get; set; }

    [JsonProperty("created_date_less_than")]
    public DateTime? CreatedDateLessThan { get; set; }
}