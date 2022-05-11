using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.HearingAuditLog;

public class HearingAuditLogGetRequest
{
    [JsonProperty("search_type")]
    [Range(1, 9)]
    public int SearchType { get; set; }

    [JsonProperty("hearing_id")]
    public int? HearingId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid? DisputeGuid { get; set; }

    [JsonProperty("hearing_owner")]
    public int? HearingOwner { get; set; }

    [JsonProperty("start_date")]
    public DateTime? StartDate { get; set; }

    [JsonProperty("end_date")]
    public DateTime? EndDate { get; set; }

    [JsonProperty("system_user_id")]
    public int? CreatedBy { get; set; }
}