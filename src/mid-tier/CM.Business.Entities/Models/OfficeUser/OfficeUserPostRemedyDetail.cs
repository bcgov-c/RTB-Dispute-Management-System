using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OfficeUser;

public class OfficeUserPostRemedyDetail
{
    [JsonProperty("participant_id")]
    [Range(1, int.MaxValue)]
    public int ParticipantId { get; set; }

    [JsonProperty("description")]
    [StringLength(500)]
    [Required]
    public string Description { get; set; }

    [JsonProperty("amount")]
    public decimal Amount { get; set; }

    [JsonProperty("associated_date")]
    public DateTime? AssociatedDate { get; set; }

    [JsonProperty("position_status")]
    [Required]
    [Range(1, byte.MaxValue)]
    public byte PositionStatus { get; set; }
}