using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Files;

public class FilePackageRequest
{
    [JsonProperty("created_by_id")]
    public int? CreatedById { get; set; }

    [StringLength(10)]
    [JsonProperty("created_by_access_code")]
    public string CreatedByAccessCode { get; set; }

    [StringLength(100)]
    [JsonProperty("package_title")]
    public string PackageTitle { get; set; }

    [StringLength(10000)]
    [JsonProperty("package_description")]
    public string PackageDescription { get; set; }

    [JsonProperty("package_type")]
    public byte? PackageType { get; set; }

    [JsonProperty("package_date")]
    public DateTime? PackageDate { get; set; }
}