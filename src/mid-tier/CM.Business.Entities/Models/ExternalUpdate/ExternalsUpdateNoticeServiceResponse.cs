using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ExternalUpdate;

public class ExternalsUpdateNoticeServiceResponse
{
    [JsonProperty("notice_service_id")]
    public int NoticeServiceId { get; set; }

    [JsonProperty("participant_id")]
    public int ParticipantId { get; set; }

    [JsonProperty("service_method")]
    public byte? ServiceMethod { get; set; }

    [JsonProperty("service_date")]
    public string ServiceDate { get; set; }

    [JsonProperty("service_comment")]
    public string ServiceComment { get; set; }

    [JsonProperty("served_by")]
    public int? ServedBy { get; set; }

    [JsonProperty("is_served")]
    public bool? IsServed { get; set; }

    [JsonProperty("notice_service_file_1id")]
    public int? NoticeServiceFile1Id { get; set; }

    [JsonProperty("notice_service_file_2id")]
    public int? NoticeServiceFile2Id { get; set; }

    [JsonProperty("notice_service_file_3id")]
    public int? NoticeServiceFile3Id { get; set; }

    [JsonProperty("notice_service_file_4id")]
    public int? NoticeServiceFile4Id { get; set; }

    [JsonProperty("notice_service_file_5id")]
    public int? NoticeServiceFile5Id { get; set; }

    [JsonProperty("modified_date")]
    public string ModifiedDate { get; set; }
}