using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Remedy;

public class RemedyRequest
{
    [JsonProperty("remedy_title")]
    [StringLength(150)]
    public string RemedyTitle { get; set; }

    [JsonProperty("remedy_status")]
    public byte RemedyStatus { get; set; }

    [JsonProperty("remedy_type")]
    public byte RemedyType { get; set; }

    [JsonProperty("remedy_source")]
    public byte RemedySource { get; set; }

    [JsonProperty("is_amended")]
    public bool? IsAmended { get; set; }

    [JsonProperty("remedy_sub_status")]
    public byte? RemedySubStatus { get; set; }

    [JsonProperty("remedy_status_reason")]
    [StringLength(255)]
    public string RemedyStatusReason { get; set; }

    [JsonProperty("remedy_status_reason_code")]
    public byte? RemedyStatusReasonCode { get; set; }

    [JsonProperty("awarded_amount")]
    public decimal? AwardedAmount { get; set; }

    [JsonProperty("awarded_date")]
    public DateTime? AwardedDate { get; set; }

    [JsonProperty("awarded_days_after_service")]
    public int? AwardedDaysAfterService { get; set; }

    [JsonProperty("award_details")]
    [StringLength(255)]
    public string AwardDetails { get; set; }

    [JsonProperty("is_reviewed")]
    public bool? IsReviewed { get; set; }

    [JsonProperty("prev_remedy_status")]
    public byte? PrevRemedyStatus { get; set; }

    [JsonProperty("prev_remedy_sub_status")]
    public byte? PrevRemedySubStatus { get; set; }

    [JsonProperty("prev_awarded_amount")]
    public decimal? PrevAwardedAmount { get; set; }

    [JsonProperty("prev_awarded_date")]
    public DateTime? PrevAwardedDate { get; set; }

    [JsonProperty("prev_awarded_days_after_service")]
    public int? PrevAwardedDaysAfterService { get; set; }

    [JsonProperty("prev_award_details")]
    public string PrevAwardDetails { get; set; }

    [JsonProperty("prev_award_by")]
    public int? PrevAwardBy { get; set; }

    [JsonProperty("prev_award_date")]
    public DateTime? PrevAwardDate { get; set; }

    [JsonProperty("prev_remedy_status_reason")]
    public byte? PrevRemedyStatusReason { get; set; }

    [JsonProperty("prev_remedy_status_reason_code")]
    public byte? PrevRemedyStatusReasonCode { get; set; }
}