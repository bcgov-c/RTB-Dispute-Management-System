using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Payment;

public class PaymentTransactionResponse : CommonResponse
{
    [JsonProperty("payment_transaction_id")]
    public int PaymentTransactionId { get; set; }

    [JsonProperty("transaction_site_source")]
    public byte? TransactionSiteSource { get; set; }

    [JsonProperty("dispute_fee_id")]
    public int DisputeFeeId { get; set; }

    [JsonProperty("transaction_method")]
    public int TransactionMethod { get; set; }

    [JsonProperty("office_payment_idir")]
    public string OfficePaymentIdir { get; set; }

    [JsonProperty("payment_note")]
    public string PaymentNote { get; set; }

    [JsonProperty("transaction_by")]
    public int? TransactionBy { get; set; }

    [JsonProperty("transaction_amount")]
    public decimal? TransactionAmount { get; set; }

    [JsonProperty("payment_status")]
    public byte? PaymentStatus { get; set; }

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

    [JsonProperty("payment_url")]
    public string PaymentUrl { get; set; }

    [JsonProperty("card_type")]
    public string CardType { get; set; }

    [JsonProperty("trn_req_date")]
    public string TrnReqDate { get; set; }

    [JsonProperty("trn_approved")]
    public bool TrnApproved { get; set; }

    [JsonProperty("trn_date")]
    public string TrnDate { get; set; }

    [JsonProperty("trn_id")]
    public string TrnId { get; set; }

    [JsonProperty("trn_type")]
    public string TrnType { get; set; }

    [JsonProperty("payment_verified")]
    public byte? PaymentVerified { get; set; }

    [JsonProperty("reconcile_status")]
    public byte? ReconcileStatus { get; set; }

    [JsonProperty("reconcile_date")]
    public string ReconcileDate { get; set; }
}

public class PaymentTransactionForReport : PaymentTransactionResponse
{
    public byte? PaymentProvider { get; set; }

    public bool IsDeleted { get; set; }
}