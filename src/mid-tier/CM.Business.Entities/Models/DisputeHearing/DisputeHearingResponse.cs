using System;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.DisputeHearing;

public class DisputeHearingResponse : CommonResponse
{
    [JsonProperty("dispute_hearing_id")]
    public int DisputeHearingId { get; set; }

    [JsonProperty("hearing_id")]
    public int HearingId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid? DisputeGuid { get; set; }

    [JsonProperty("file_number")]
    public int? FileNumber { get; set; }

    [JsonProperty("external_file_id")]
    public string ExternalFileId { get; set; }

    [JsonProperty("dispute_hearing_role")]
    public byte DisputeHearingRole { get; set; }

    [JsonProperty("dispute_hearing_status")]
    public byte? DisputeHearingStatus { get; set; }

    [JsonProperty("shared_hearing_link_type")]
    public byte? SharedHearingLinkType { get; set; }

    [JsonProperty("is_deleted")]
    public bool? IsDeleted { get; set; }
}