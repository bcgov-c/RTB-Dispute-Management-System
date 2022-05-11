// ReSharper disable InconsistentNaming

using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.CmsArchive;

public class CmsArchiveSearchResult
{
    [JsonProperty("file_number")]
    public string File_Number { get; set; }

    [JsonProperty("reference_number")]
    public string Reference_Number { get; set; }

    [JsonProperty("dispute_address")]
    public string Dispute_Address { get; set; }

    [JsonProperty("dispute_city")]
    public string Dispute_City { get; set; }

    [JsonProperty("dispute_type")]
    public byte? Dispute_Type { get; set; }

    [JsonProperty("applicant_type")]
    public byte? Applicant_Type { get; set; }

    [JsonProperty("direct_request")]
    public byte? Direct_Request { get; set; }

    [JsonProperty("dispute_codes")]
    public string Dispute_Codes { get; set; }

    [JsonProperty("filing_fee")]
    public string Filing_Fee { get; set; }

    [JsonProperty("first_applicant_last_name")]
    public string First_Applicant_Last_Name { get; set; }

    [JsonProperty("first_agent_last_name")]
    public string First_Agent_Last_Name { get; set; }

    [JsonProperty("first_respondent_last_name")]
    public string First_Respondent_Last_Name { get; set; }

    [JsonProperty("hearing_date")]
    public DateTime? Hearing_Date { get; set; }

    [JsonProperty("joiner_type")]
    public byte? Joiner_Type { get; set; }

    [JsonProperty("cross_app_file_number")]
    public string Cross_App_File_Number { get; set; }

    [JsonProperty("dispute_status")]
    public byte? Dispute_Status { get; set; }

    [JsonProperty("dro_code")]
    public string DRO_Code { get; set; }

    [JsonProperty("dms_file_number")]
    public int? DMS_File_Number { get; set; }

    [JsonProperty("dms_file_guid")]
    public Guid? DMS_File_GUID { get; set; }

    [JsonProperty("submitted_date")]
    public string Submitted_Date { get; set; }

    [JsonProperty("created_date")]
    public string Created_Date { get; set; }

    [JsonProperty("last_modified_date")]
    public string Last_Modified_Date { get; set; }
}