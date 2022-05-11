using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Search;

public class DisputeInfoSearchRequest : SearchRequestBaseWithFilters
{
    [JsonProperty("dispute_type")]
    public byte? DisputeType { get; set; }

    [JsonProperty("dispute_sub_type")]
    public byte? DisputeSubType { get; set; }

    [JsonProperty("tenancy_address")]
    [MinLength(4)]
    public string TenancyAddress { get; set; }

    [JsonProperty("tenancy_zip_postal")]
    [MinLength(3)]
    public string TenancyZipPostal { get; set; }

    [JsonProperty("tenancy_ended")]
    public byte? TenancyEnded { get; set; }

    [JsonProperty("creation_method")]
    public byte? CreationMethod { get; set; }

    [JsonProperty("submitted_date")]
    public DateTime? SubmittedDate { get; set; }

    [JsonProperty("created_date")]
    public DateTime? CreatedDate { get; set; }

    [JsonProperty("modified_date")]
    public DateTime? ModifiedDate { get; set; }
}