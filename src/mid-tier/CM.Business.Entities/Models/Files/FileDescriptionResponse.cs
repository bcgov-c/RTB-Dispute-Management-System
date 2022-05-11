using System;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Files;

public class FileDescriptionResponse : CommonResponse
{
    [JsonProperty("file_description_id")]
    public int FileDescriptionId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("title")]
    public string Title { get; set; }

    [JsonProperty("claim_id")]
    public int ClaimId { get; set; }

    [JsonProperty("remedy_id")]
    public int RemedyId { get; set; }

    [JsonProperty("description_by")]
    public int DescriptionBy { get; set; }

    [JsonProperty("description")]
    public string Description { get; set; }

    [JsonProperty("description_category")]
    public byte DescriptionCategory { get; set; }

    [JsonProperty("description_code")]
    public byte DescriptionCode { get; set; }

    [JsonProperty("file_method")]
    public byte FileMethod { get; set; }

    [JsonProperty("discussed")]
    public bool Discussed { get; set; }

    [JsonProperty("decision_reference")]
    public byte DecisionReference { get; set; }

    [JsonProperty("is_deficient")]
    public bool IsDeficient { get; set; }

    [JsonProperty("is_deficient_reason")]
    public string IsDeficientReason { get; set; }
}