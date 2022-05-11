using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Files;

public class FilePackagePatchRequest
{
    [JsonProperty("package_title")]
    public string PackageTitle { get; set; }

    [JsonProperty("package_description")]
    public string PackageDescription { get; set; }

    [JsonProperty("package_type")]
    public byte? PackageType { get; set; }

    [JsonProperty("package_date")]
    public DateTime? PackageDate { get; set; }

    [JsonProperty("created_by_id")]
    public int? CreatedById { get; set; }

    [JsonProperty("created_by_access_code")]
    [StringLength(10)]
    public string CreatedByAccessCode { get; set; }
}