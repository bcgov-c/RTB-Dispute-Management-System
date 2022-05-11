using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Payment;

public class DisputeFeeRequest
{
    [JsonProperty("fee_description")]
    public string FeeDescription { get; set; }

    [JsonProperty("due_date")]
    public DateTime? DueDate { get; set; }

    [JsonProperty("is_active")]
    [Required]
    public bool IsActive { get; set; }

    [JsonProperty("fee_type")]
    [Required]
    public byte? FeeType { get; set; }

    [JsonProperty("payor_id")]
    [Required]
    public int? PayorId { get; set; }

    [JsonProperty("amount_due")]
    [Required]
    public decimal? AmountDue { get; set; }
}

public class PostDisputeFeeRequest : DisputeFeeRequest
{
}

public class PatchDisputeFeeRequest : DisputeFeeRequest
{
    [JsonProperty("method_paid")]
    public int MethodPaid { get; set; }

    [JsonProperty("is_paid")]
    public bool IsPaid { get; set; }

    [JsonProperty("date_paid")]
    public DateTime DatePaid { get; set; }

    [JsonProperty("amount_paid")]
    public decimal AmountPaid { get; set; }
}