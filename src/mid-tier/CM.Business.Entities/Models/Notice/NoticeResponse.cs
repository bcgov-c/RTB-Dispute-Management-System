using System.Collections.Generic;
using CM.Business.Entities.Models.Base;
using CM.Business.Entities.Models.NoticeService;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Notice;

public class NoticeResponse : CommonResponse
{
    [JsonProperty("notice_id")]
    public int NoticeId { get; set; }

    [JsonProperty("parent_notice_id")]
    public int? ParentNoticeId { get; set; }

    [JsonProperty("notice_file1_id")]
    public int? NoticeFile1Id { get; set; }

    [JsonProperty("notice_file2_id")]
    public int? NoticeFile2Id { get; set; }

    [JsonProperty("notice_file3_id")]
    public int? NoticeFile3Id { get; set; }

    [JsonProperty("notice_file4_id")]
    public int? NoticeFile4Id { get; set; }

    [JsonProperty("notice_file5_id")]
    public int? NoticeFile5Id { get; set; }

    [JsonProperty("notice_title")]
    public string NoticeTitle { get; set; }

    [JsonProperty("notice_type")]
    public byte NoticeType { get; set; }

    [JsonProperty("is_initial_dispute_notice")]
    public bool? IsInitialDisputeNotice { get; set; }

    [JsonProperty("respondent_type")]
    public byte? RespondentType { get; set; }

    [JsonProperty("notice_version")]
    public byte? NoticeVersion { get; set; }

    [JsonProperty("hearing_id")]
    public int? HearingId { get; set; }

    [JsonProperty("hearing_type")]
    public byte? HearingType { get; set; }

    [JsonProperty("notice_special_instructions")]
    public string NoticeSpecialInstructions { get; set; }

    [JsonProperty("notice_html_for_pdf")]
    public string NoticeHtmlForPdf { get; set; }

    [JsonProperty("notice_delivery_method")]
    public byte? NoticeDeliveryMethod { get; set; }

    [JsonProperty("notice_delivered_to")]
    public int? NoticeDeliveredTo { get; set; }

    [JsonProperty("notice_delivered_date")]
    public string NoticeDeliveredDate { get; set; }

    [JsonProperty("conference_bridge_id")]
    public int? ConferenceBridgeId { get; set; }

    [JsonProperty("notice_associated_to")]
    public byte? NoticeAssociatedTo { get; set; }

    [JsonProperty("notice_service")]
    public List<NoticeServiceResponse> NoticeServices { get; set; }

    [JsonProperty("notice_file_description_id")]
    public int? NoticeFileDescriptionId { get; set; }

    [JsonProperty("notice_delivered_to_other")]
    public string NoticeDeliveredToOther { get; set; }
}