using System;
using System.Collections.Generic;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ExternalCustomDataObject;

public class ExternalCustomObjectGetRequest
{
    [JsonProperty("request_active_only")]
    public bool IsActive { get; set; } = true;

    [JsonProperty("object_types")]
    public List<ExternalCustomObjectType> Types { get; set; }

    [JsonProperty("object_statuses")]
    public List<byte> Statuses { get; set; }

    [JsonProperty("object_sub_statuses")]
    public List<byte> SubStatuses { get; set; }

    [JsonProperty("created_date")]
    public DateTime CreatedDate { get; set; }

    [JsonProperty("count")]
    public int Count { get; set; } = 10;

    [JsonProperty("index")]
    public int Index { get; set; }

    [JsonProperty("sort_by_field")]
    public CustomObjectSortField SortBy { get; set; }
}