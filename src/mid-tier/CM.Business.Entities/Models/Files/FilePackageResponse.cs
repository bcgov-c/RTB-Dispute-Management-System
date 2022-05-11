using System;
using System.Collections.Generic;
using CM.Business.Entities.Models.Base;
using CM.Business.Entities.Models.FilePackageService;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Files;

public class FilePackageResponse : CommonResponse
{
    [JsonProperty("file_package_id")]
    public int FilePackageId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("created_by_id")]
    public int? CreatedById { get; set; }

    [JsonProperty("created_by_access_code")]
    public string CreatedByAccessCode { get; set; }

    [JsonProperty("package_title")]
    public string PackageTitle { get; set; }

    [JsonProperty("package_description")]
    public string PackageDescription { get; set; }

    [JsonProperty("package_type")]
    public byte? PackageType { get; set; }

    [JsonProperty("package_date")]
    public string PackageDate { get; set; }

    [JsonProperty("is_deleted")]
    public bool? IsDeleted { get; set; }

    [JsonProperty("file_package_service")]
    public List<FilePackageServiceResponse> FilePackageServices { get; set; }
}