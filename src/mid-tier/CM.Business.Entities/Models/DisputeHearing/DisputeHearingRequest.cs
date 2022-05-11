using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.DisputeHearing;

public class DisputeHearingRequest
{
    [JsonProperty("hearing_id")]
    public int HearingId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid? DisputeGuid { get; set; }

    [JsonProperty("external_file_id")]
    public string ExternalFileId { get; set; }

    [JsonProperty("dispute_hearing_role")]
    public byte DisputeHearingRole { get; set; }

    [JsonProperty("dispute_hearing_status")]
    public byte? DisputeHearingStatus { get; set; }

    [JsonProperty("shared_hearing_link_type")]
    public byte? SharedHearingLinkType { get; set; }

    [JsonProperty("notice_conference_bridge_id")]
    public int? NoticeConferenceBridgeId { get; set; }
}

public class DisputeHearingPatchRequest
{
    [JsonProperty("dispute_hearing_status")]
    public byte? DisputeHearingStatus { get; set; }

    [JsonProperty("shared_hearing_link_type")]
    public byte? SharedHearingLinkType { get; set; }
}