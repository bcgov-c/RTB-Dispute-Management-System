using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AccessCode;

public class DisputeAccessPaymentTransaction : CommonResponse
{
    [JsonProperty("payment_transaction_id")]
    public int PaymentTransactionId { get; set; }

    [JsonProperty("dispute_fee_id")]
    public int DisputeFeeId { get; set; }

    [JsonProperty("transaction_method")]
    public int TransactionMethod { get; set; }

    [JsonProperty("transaction_by")]
    public int? TransactionBy { get; set; }

    [JsonProperty("transaction_amount")]
    public decimal? TransactionAmount { get; set; }

    [JsonProperty("payment_status")]
    public byte? PaymentStatus { get; set; }

    [JsonProperty("payment_verified")]
    public byte? PaymentVerified { get; set; }

    [JsonProperty("payment_verified_retries")]
    public byte? PaymentVerifiedRetries { get; set; }

    [JsonProperty("fee_waiver_tenants_family")]
    public byte? FeeWaiverTenantsFamily { get; set; }

    [JsonProperty("fee_waiver_income")]
    public decimal? FeeWaiverIncome { get; set; }

    [JsonProperty("fee_waiver_city_size")]
    public byte? FeeWaiverCitySize { get; set; }

    [JsonProperty("fee_waiver_hardship")]
    public bool? FeeWaiverHardship { get; set; }

    [JsonProperty("fee_waiver_hardship_details")]
    public string FeeWaiverHardshipDetails { get; set; }
}