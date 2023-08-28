using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Notice;

public class NoticePatchRequest
{
    [JsonProperty("parent_notice_id")]
    public int? ParentNoticeId { get; set; }

    [JsonProperty("notice_title")]
    [Required]
    [StringLength(100)]
    public string NoticeTitle { get; set; }

    [JsonProperty("notice_type")]
    [Required]
    [Range(1, 256)]
    public byte NoticeType { get; set; }

    [JsonProperty("respondent_type")]
    public byte? RespondentType { get; set; }

    [JsonProperty("hearing_id")]
    public int? HearingId { get; set; }

    [JsonProperty("hearing_type")]
    public byte? HearingType { get; set; }

    [JsonProperty("notice_special_instructions")]
    [StringLength(1500)]
    public string NoticeSpecialInstructions { get; set; }

    [JsonProperty("notice_html_for_pdf")]
    public string NoticeHtmlForPdf { get; set; }

    [JsonProperty("notice_delivery_method")]
    public byte? NoticeDeliveryMethod { get; set; }

    [JsonProperty("notice_delivered_to")]
    public int? NoticeDeliveredTo { get; set; }

    [JsonProperty("notice_delivered_date")]
    public DateTime? NoticeDeliveredDate { get; set; }

    [JsonProperty("conference_bridge_id")]
    public int? ConferenceBridgeId { get; set; }

    [JsonProperty("notice_associated_to")]
    public byte? NoticeAssociatedTo { get; set; }

    [JsonProperty("notice_file_description_id")]
    public int? NoticeFileDescriptionId { get; set; }

    [JsonProperty("notice_delivered_to_other")]
    [StringLength(100)]
    public string NoticeDeliveredToOther { get; set; }

    [JsonProperty("has_service_deadline")]
    public bool? HasServiceDeadline { get; set; }

    [JsonProperty("service_deadline_days")]
    public int? ServiceDeadlineDays { get; set; }

    [JsonProperty("service_deadline_date")]
    public DateTime? ServiceDeadlineDate { get; set; }

    [JsonProperty("second_service_deadline_date")]
    public DateTime? SecondServiceDeadlineDate { get; set; }
}