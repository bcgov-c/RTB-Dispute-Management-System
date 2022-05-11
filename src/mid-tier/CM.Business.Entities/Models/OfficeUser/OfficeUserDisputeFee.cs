using System.Collections.Generic;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OfficeUser;

public class OfficeUserDisputeFee : CommonResponse
{
    [JsonProperty("dispute_fee_id")]
    public int DisputeFeeId { get; set; }

    [JsonProperty("due_date")]
    public string DueDate { get; set; }

    [JsonProperty("is_active")]
    public bool? IsActive { get; set; }

    [JsonProperty("fee_type")]
    public byte? FeeType { get; set; }

    [JsonProperty("fee_description")]
    public string FeeDescription { get; set; }

    [JsonProperty("payor_id")]
    public int? PayorId { get; set; }

    [JsonProperty("amount_due")]
    public decimal? AmountDue { get; set; }

    [JsonProperty("method_paid")]
    public byte? MethodPaid { get; set; }

    [JsonProperty("is_paid")]
    public bool? IsPaid { get; set; }

    [JsonProperty("date_paid")]
    public string DatePaid { get; set; }

    [JsonProperty("amount_paid")]
    public decimal? AmountPaid { get; set; }

    [JsonProperty("payment_transactions")]
    public List<OfficeUserPaymentTransaction> PaymentTransactions { get; set; }
}