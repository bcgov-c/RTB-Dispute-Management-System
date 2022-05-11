using System;
using System.ComponentModel.DataAnnotations;
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

    [JsonProperty("notice_file1_id")]
    [Range(1, int.MaxValue)]
    public int? NoticeFile1Id { get; set; }

    [JsonProperty("notice_file2_id")]
    [Range(1, int.MaxValue)]
    public int? NoticeFile2Id { get; set; }

    [JsonProperty("notice_file3_id")]
    [Range(1, int.MaxValue)]
    public int? NoticeFile3Id { get; set; }

    [JsonProperty("notice_file4_id")]
    [Range(1, int.MaxValue)]
    public int? NoticeFile4Id { get; set; }

    [JsonProperty("notice_file5_id")]
    [Range(1, int.MaxValue)]
    public int? NoticeFile5Id { get; set; }

    [JsonProperty("notice_file_description_id")]
    public int NoticeFileDescriptionId { get; set; }
}