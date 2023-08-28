using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OfficeUser;

public class OfficeUserPostNoticeRequest
{
    [JsonProperty("notice_delivered_to")]
    public int NoticeDeliveredTo { get; set; }

    [JsonProperty("parent_notice_id")]
    public int ParentNoticeId { get; set; }

    [JsonProperty("notice_delivered_date")]
    public DateTime NoticeDeliveredDate { get; set; }

    [JsonProperty("notice_file_description_id")]
    public int NoticeFileDescriptionId { get; set; }
}