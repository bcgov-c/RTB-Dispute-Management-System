using System;
using System.Collections.Generic;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.HearingAuditLog;

public class HearingAuditLogGetResponse
{
    public HearingAuditLogGetResponse()
    {
        HearingAuditLogs = new List<HearingAuditLogResponse>();
    }

    [JsonProperty("total_available_records")]
    public int TotalAvailableRecords { get; set; }

    [JsonProperty("hearing_audit_logs")]
    public List<HearingAuditLogResponse> HearingAuditLogs { get; set; }
}

public class HearingAuditLogResponse
{
    [JsonProperty("hearing_history_id")]
    public int HearingAuditLogId { get; set; }

    [JsonProperty("hearing_change_type")]
    public HearingChangeType HearingChangeType { get; set; }

    [JsonProperty("hearing_id")]
    public int HearingId { get; set; }

    [JsonProperty("hearing_type")]
    public byte? HearingType { get; set; }

    [JsonProperty("hearing_subtype")]
    public byte? HearingSubType { get; set; }

    [JsonProperty("hearing_priority")]
    public byte? HearingPriority { get; set; }

    [JsonProperty("conference_bridge_id")]
    public int? ConferenceBridgeId { get; set; }

    [JsonProperty("hearing_owner")]
    public int HearingOwner { get; set; }

    [JsonProperty("hearing_start_datetime")]
    public string HearingStartDateTime { get; set; }

    [JsonProperty("hearing_end_datetime")]
    public string HearingEndDateTime { get; set; }

    [JsonProperty("local_start_datetime")]
    public string LocalStartDateTime { get; set; }

    [JsonProperty("local_end_datetime")]
    public string LocalEndDateTime { get; set; }

    [JsonProperty("dispute_hearing_role")]
    public byte? DisputeHearingRole { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid? DisputeGuid { get; set; }

    [JsonProperty("file_number")]
    public int? FileNumber { get; set; }

    [JsonProperty("shared_hearing_link_type")]
    public byte? SharedHearingLinkType { get; set; }

    [JsonProperty("created_date")]
    public string CreatedDate { get; set; }

    [JsonProperty("created_by")]
    public int? CreatedBy { get; set; }
}