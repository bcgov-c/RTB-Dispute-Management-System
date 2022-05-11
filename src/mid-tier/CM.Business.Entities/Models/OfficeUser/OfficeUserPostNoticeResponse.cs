using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OfficeUser;

public class OfficeUserPostNoticeResponse : CommonResponse
{
    [JsonProperty("notice_id")]
    public int NoticeId { get; set; }

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

    [JsonProperty("notice_version")]
    public byte? NoticeVersion { get; set; }

    [JsonProperty("notice_delivery_method")]
    public byte? NoticeDeliveryMethod { get; set; }

    [JsonProperty("notice_delivered_to")]
    public int? NoticeDeliveredTo { get; set; }

    [JsonProperty("notice_delivered_date")]
    public string NoticeDeliveredDate { get; set; }
}