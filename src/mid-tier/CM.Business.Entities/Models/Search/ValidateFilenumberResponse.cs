using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Search;

public class ValidateFilenumberResponse
{
    [JsonProperty("validated")]
    public bool Validated { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid? DisputeGuid { get; set; }
}