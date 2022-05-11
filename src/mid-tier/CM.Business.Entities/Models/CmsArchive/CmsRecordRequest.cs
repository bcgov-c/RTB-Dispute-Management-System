// ReSharper disable InconsistentNaming

using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.CmsArchive;

public class CmsRecordRequest
{
    [JsonProperty("dms_file_number")]
    public int? DMS_File_Number { get; set; }

    [JsonProperty("dms_file_guid")]
    public Guid? DMS_File_Guid { get; set; }
}