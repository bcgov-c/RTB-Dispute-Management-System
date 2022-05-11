using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AccessCode;

public class DisputeAccessRemedy
{
    public DisputeAccessRemedy()
    {
        RemedyDetails = new List<DisputeAccessRemedyDetail>();
    }

    [JsonProperty("remedy_id")]
    public int RemedyId { get; set; }

    [JsonProperty("remedy_title")]
    public string RemedyTitle { get; set; }

    [JsonProperty("remedy_status")]
    public byte? RemedyStatus { get; set; }

    [JsonProperty("remedy_type")]
    public byte? RemedyType { get; set; }

    [JsonProperty("remedy_source")]
    public byte? RemedySource { get; set; }

    [JsonProperty("is_amended")]
    public bool? IsAmended { get; set; }

    [JsonProperty("created_date")]
    public string CreatedDate { get; set; }

    [JsonProperty("created_by")]
    public int? CreatedBy { get; set; }

    [JsonProperty("remedy_details")]
    public List<DisputeAccessRemedyDetail> RemedyDetails { get; set; }
}