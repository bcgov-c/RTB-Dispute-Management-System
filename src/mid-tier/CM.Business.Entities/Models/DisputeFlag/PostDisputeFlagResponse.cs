using System;
using System.ComponentModel.DataAnnotations;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.DisputeFlag;

public class PostDisputeFlagResponse : CommonResponse
{
    [JsonProperty("dispute_flag_id")]
    public int DisputeFlagId { get; set; }

    [JsonProperty("file_number")]
    public int? FileNumber { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("flag_title")]
    [StringLength(50)]
    public string FlagTitle { get; set; }

    [JsonProperty("flag_status")]
    public byte FlagStatus { get; set; }

    [JsonProperty("flag_type")]
    public byte FlagType { get; set; }

    [JsonProperty("flag_subtype")]
    public byte? FlagSubType { get; set; }

    [JsonProperty("is_public")]
    public bool IsPublic { get; set; }

    [JsonProperty("related_object_id")]
    public int? RelatedObjectId { get; set; }

    [JsonProperty("flag_participant_id")]
    public int? FlagParticipantId { get; set; }

    [JsonProperty("flag_owner_id")]
    public int? FlagOwnerId { get; set; }

    [JsonProperty("flag_start_date")]
    public string FlagStartDate { get; set; }

    [JsonProperty("flag_end_date")]
    public string FlagEndDate { get; set; }
}