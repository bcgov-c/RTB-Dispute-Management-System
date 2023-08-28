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

    [JsonProperty("proof_file_description_id")]
    public int? ProofFileDescriptionId { get; set; }

    [JsonProperty("validation_status")]
    public byte? ValidationStatus { get; set; }

    [JsonProperty("other_proof_file_description_id")]
    public int? OtherProofFileDescriptionId { get; set; }

    [JsonProperty("service_description")]
    public string ServiceDescription { get; set; }
}