using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ClaimDetail;

public class ClaimDetailRequest
{
    [JsonProperty("description_by")]
    [Range(1, int.MaxValue)]
    public int DescriptionBy { get; set; }

    [JsonProperty("description")]
    [StringLength(1000)]
    public string Description { get; set; }

    [JsonProperty("notice_date")]
    public DateTime? NoticeDate { get; set; }

    [JsonProperty("notice_method")]
    public byte? NoticeMethod { get; set; }

    [JsonProperty("when_aware")]
    [StringLength(255)]
    public string WhenAware { get; set; }

    [JsonProperty("location")]
    [StringLength(255)]
    public string Location { get; set; }

    [JsonProperty("impact")]
    [StringLength(750)]
    public string Impact { get; set; }

    [JsonProperty("is_amended")]
    public bool? IsAmended { get; set; }

    [JsonProperty("position_status")]
    public byte? PositionStatus { get; set; }
}