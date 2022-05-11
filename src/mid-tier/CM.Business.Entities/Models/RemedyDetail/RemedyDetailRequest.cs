using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.RemedyDetail;

public class RemedyDetailRequest
{
    [JsonProperty("description_by")]
    [Range(1, int.MaxValue)]
    public int DescriptionBy { get; set; }

    [JsonProperty("description")]
    [StringLength(500)]
    public string Description { get; set; }

    [JsonProperty("amount")]
    public decimal Amount { get; set; }

    [JsonProperty("is_amended")]
    public bool? IsAmended { get; set; }

    [JsonProperty("associated_date")]
    public DateTime? AssociatedDate { get; set; }

    [JsonProperty("position_status")]
    public byte? PositionStatus { get; set; }
}