using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Dispute;

public class CreateDisputeResponse
{
    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }
}