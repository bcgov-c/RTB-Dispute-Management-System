using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Amendment;

public class AmendmentRequest
{
    [JsonProperty("notice_id")]
    public int? NoticeId { get; set; }

    [JsonProperty("amendment_title")]
    [Required]
    public string AmendmentTitle { get; set; }

    [JsonProperty("amendment_to")]
    [Range(1, 256)]
    public byte AmendmentTo { get; set; }

    [JsonProperty("is_internally_initiated")]
    public bool? IsInternallyInitiated { get; set; }

    [JsonProperty("amendment_change_type")]
    [Range(1, 256)]
    public byte AmendmentChangeType { get; set; }

    [JsonProperty("amendment_change_html")]
    [Required]
    public string AmendmentChangeHtml { get; set; }

    [JsonProperty("amendment_submitter_id")]
    public int? AmendmentSubmitterId { get; set; }

    [JsonProperty("amendment_pending_data")]
    public string AmendmentPendingData { get; set; }

    [JsonProperty("amendment_status")]
    public byte? AmendmentStatus { get; set; }

    [JsonProperty("amendment_description")]
    [StringLength(255)]
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