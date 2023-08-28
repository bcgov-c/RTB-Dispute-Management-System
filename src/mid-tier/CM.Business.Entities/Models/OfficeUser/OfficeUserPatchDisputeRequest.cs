using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OfficeUser;

public class OfficeUserPatchDisputeRequest
{
    [JsonProperty("dispute_urgency")]
    public byte? DisputeUrgency { get; set; }

    [JsonProperty("original_notice_delivered")]
    public bool? OriginalNoticeDelivered { get; set; }

    [JsonProperty("original_notice_date")]
    public DateTime? OriginalNoticeDate { get; set; }

    [JsonProperty("initial_payment_date")]
    public DateTime? InitialPaymentDate { get; set; }

    [JsonProperty("initial_payment_by")]
    public int? InitialPaymentBy { get; set; }

    [JsonProperty("initial_payment_method")]
    public byte? InitialPaymentMethod { get; set; }

    [JsonProperty("submitted_date")]
    public DateTime? SubmittedDate { get; set; }

    [JsonProperty("submitted_by")]
    public int? SubmittedBy { get; set; }

    [JsonProperty("tenancy_address_validated")]
    public bool? TenancyAddressValidated { get; set; }
}