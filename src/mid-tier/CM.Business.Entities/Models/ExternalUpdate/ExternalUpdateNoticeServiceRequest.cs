using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ExternalUpdate;

public class ExternalUpdateNoticeServiceRequest
{
    [JsonProperty("service_method")]
    public byte? ServiceMethod { get; set; }

    [JsonProperty("service_date")]
    public DateTime? ServiceDate { get; set; }

    [StringLength(255)]
    [JsonProperty("service_comment")]
    public string ServiceComment { get; set; }

    [JsonProperty("service_date_used")]
    public byte? ServiceDateUsed { get; set; }

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

    [JsonProperty("proof_file_description_id")]
    public int? ProofFileDescriptionId { get; set; }
}