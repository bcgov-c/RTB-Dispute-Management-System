// ReSharper disable InconsistentNaming

using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.CmsArchive;

public class CmsArchiveSearchRequest : CmsArchiveSearchBase
{
    [JsonProperty("search_type")]
    public byte SearchType { get; set; }

    [JsonProperty("file_number")]
    [MinLength(5)]
    public string File_Number { get; set; }

    [JsonProperty("reference_number")]
    [MinLength(6)]
    public string Reference_Number { get; set; }

    [JsonProperty("dispute_address")]
    [StringLength(80, MinimumLength =4)]
    public string Dispute_Address { get; set; }

    [JsonProperty("dispute_city")]
    [StringLength(100, MinimumLength =3)]
    public string Dispute_City { get; set; }

    [JsonProperty("applicant_type")]
    public byte? Applicant_Type { get; set; }

    [JsonProperty("first_name")]
    [StringLength(20, MinimumLength =2)]
    public string First_Name { get; set; }

    [JsonProperty("last_name")]
    [StringLength(20, MinimumLength =2)]
    public string Last_Name { get; set; }

    [JsonProperty("daytime_phone")]
    public string DayTime_Phone { get; set; }

    [JsonProperty("email")]
    [MinLength(10)]
    public string Email_Address { get; set; }

    [JsonProperty("participant_type")]
    public byte? Participant_Type { get; set; }
}