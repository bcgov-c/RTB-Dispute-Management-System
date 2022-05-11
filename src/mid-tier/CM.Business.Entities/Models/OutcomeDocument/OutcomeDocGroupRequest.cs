using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OutcomeDocument;

public class OutcomeDocGroupRequest
{
    [JsonProperty("doc_group_type")]
    public byte DocGroupType { get; set; }

    [JsonProperty("doc_group_sub_type")]
    public byte? DocGroupSubType { get; set; }

    [JsonProperty("doc_status")]
    public byte? DocStatus { get; set; }

    [JsonProperty("doc_preparation_time")]
    public int? DocPreparationTime { get; set; }

    [JsonProperty("doc_complexity")]
    public byte? DocComplexity { get; set; }

    [JsonProperty("doc_version")]
    public byte? DocVersion { get; set; }

    [JsonProperty("doc_note")]
    [StringLength(255)]
    public string DocNote { get; set; }
}

public class OutcomeDocGroupPatchRequest : OutcomeDocGroupRequest
{
    [JsonProperty("doc_completed_date")]
    public DateTime? DocCompletedDate { get; set; }

    [JsonProperty("doc_writing_time")]
    public int? DocWritingTime { get; set; }
}