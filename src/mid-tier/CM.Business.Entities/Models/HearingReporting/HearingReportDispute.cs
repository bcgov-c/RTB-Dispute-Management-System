using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.HearingReporting;

public class HearingReportDispute
{
    [JsonProperty("dispute_hearing_id")]
    public int DisputeHearingId { get; set; }

    [JsonProperty("file_number")]
    public string FileNumber { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid? DisputeGuid { get; set; }

    [JsonProperty("dispute_hearing_role")]
    public byte DisputeHearingRole { get; set; }

    [JsonProperty("dispute_hearing_status")]
    public byte DisputeHearingStatus { get; set; }

    [JsonProperty("shared_hearing_link_type")]
    public byte? SharedHearingLinkType { get; set; }

    [JsonProperty("external_file_id")]
    public string ExternalFileId { get; set; }
}