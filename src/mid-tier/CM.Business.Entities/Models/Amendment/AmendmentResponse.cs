using System;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Amendment;

public class AmendmentResponse : CommonResponse
{
    [JsonProperty("amendment_id")]
    public int AmendmentId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("notice_id")]
    public int? NoticeId { get; set; }

    [JsonProperty("amendment_title")]
    public string AmendmentTitle { get; set; }

    [JsonProperty("amendment_to")]
    public byte AmendmentTo { get; set; }

    [JsonProperty("is_internally_initiated")]
    public bool? IsInternallyInitiated { get; set; }

    [JsonProperty("amendment_change_type")]
    public byte AmendmentChangeType { get; set; }

    [JsonProperty("amendment_change_html")]
    public string AmendmentChangeHtml { get; set; }

    [JsonProperty("amendment_submitter_id")]
    public int? AmendmentSubmitterId { get; set; }

    [JsonProperty("amendment_pending_data")]
    public string AmendmentPendingData { get; set; }

    [JsonProperty("amendment_status")]
    public byte? AmendmentStatus { get; set; }

    [JsonProperty("amendment_description")]
    public string AmendmentDescription { get; set; }

    [JsonProperty("amendment_file_id")]
    public int? AmendmentFileId { get; set; }

    [JsonProperty("amendment_source")]
    public byte? AmendmentSource { get; set; }

    [JsonProperty("include_in_decision")]
    public byte? IncludeInDecision { get; set; }

    [JsonProperty("amend_file_description_id")]
    public int? AmendFileDescriptionId { get; set; }
}