using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Files;

public class FileInfoPatchResponse : FileInfoResponse
{
    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }
}