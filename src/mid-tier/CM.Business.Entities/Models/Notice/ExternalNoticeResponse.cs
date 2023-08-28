using System.Collections.Generic;
using CM.Business.Entities.Models.Base;
using CM.Business.Entities.Models.NoticeService;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Notice
{
    public class ExternalNoticeResponse : CommonResponse
    {
        [JsonProperty("notice_id")]
        public int NoticeId { get; set; }

        [JsonProperty("notice_associated_to")]
        public byte? NoticeAssociatedTo { get; set; }

        [JsonProperty("notice_file_description_id")]
        public int? NoticeFileDescriptionId { get; set; }

        [JsonProperty("has_service_deadline")]
        public bool HasServiceDeadline { get; set; }

        [JsonProperty("service_deadline_days")]
        public int? ServiceDeadlineDays { get; set; }

        [JsonProperty("service_deadline_date")]
        public string ServiceDeadlineDate { get; set; }

        [JsonProperty("notice_title")]
        public string NoticeTitle { get; set; }

        [JsonProperty("notice_type")]
        public byte NoticeType { get; set; }

        [JsonProperty("parent_notice_id")]
        public int? ParentNoticeId { get; set; }

        [JsonProperty("respondent_type")]
        public byte? RespondentType { get; set; }

        [JsonProperty("notice_version")]
        public byte? NoticeVersion { get; set; }

        [JsonProperty("is_initial_dispute_notice")]
        public bool? IsInitialDisputeNotice { get; set; }

        [JsonProperty("hearing_id")]
        public int? HearingId { get; set; }

        [JsonProperty("hearing_type")]
        public byte? HearingType { get; set; }

        [JsonProperty("conference_bridge_id")]
        public int? ConferenceBridgeId { get; set; }

        [JsonProperty("notice_special_instructions")]
        public string NoticeSpecialInstructions { get; set; }

        [JsonProperty("notice_delivery_method")]
        public byte? NoticeDeliveryMethod { get; set; }

        [JsonProperty("notice_delivered_to")]
        public int? NoticeDeliveredTo { get; set; }

        [JsonProperty("notice_delivered_to_other")]
        public string NoticeDeliveredToOther { get; set; }

        [JsonProperty("notice_delivered_date")]
        public string NoticeDeliveredDate { get; set; }

        [JsonProperty("notice_service")]
        public List<ExternalNoticeServiceResponse> NoticeServices { get; set; }
    }
}
