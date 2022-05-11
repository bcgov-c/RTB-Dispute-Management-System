using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Payment;

public class PaymentTransactionRequest
{
    [JsonProperty("transaction_method")]
    [Required]
    public int? TransactionMethod { get; set; }

    [JsonProperty("office_payment_idir")]
    [StringLength(50)]
    public string OfficePaymentIdir { get; set; }

    [JsonProperty("payment_note")]
    [StringLength(255)]
    public string PaymentNote { get; set; }

    [JsonProperty("transaction_by")]
    public int? TransactionBy { get; set; }

    [JsonProperty("fee_waiver_tenants_family")]
    public byte? FeeWaiverTenantsFamily { get; set; }

    [JsonProperty("fee_waiver_income")]
    public decimal? FeeWaiverIncome { get; set; }

    [JsonProperty("fee_waiver_city_size")]
    public byte? FeeWaiverCitySize { get; set; }

    [JsonProperty("fee_waiver_hardship")]
    public bool? FeeWaiverHardship { get; set; }

    [JsonProperty("fee_waiver_hardship_details")]
    [StringLength(255)]
    public string FeeWaiverHardshipDetails { get; set; }

    [JsonProperty("payment_provider")]
    public byte? PaymentProvider { get; set; }

    [JsonProperty("transaction_amount")]
    public decimal? TransactionAmount { get; set; }

    [JsonProperty("payment_status")]
    public byte? PaymentStatus { get; set; }
}

public class PaymentTransactionPostRequest : PaymentTransactionRequest
{
    [JsonProperty("transaction_site_source")]
    public byte? TransactionSiteSource { get; set; }
}

public class PaymentTransactionPatchRequest : PaymentTransactionRequest
{
    [JsonProperty("payment_verified")]
    public byte? PaymentVerified { get; set; }

    [JsonProperty("payment_verified_retries")]
    public byte? PaymentVerifyRetries { get; set; }

    [StringLength(100)]
    [JsonProperty("display_msg")]
    public string DisplayMsg { get; set; }

    [JsonProperty("trn_response")]
    public int? TrnResponse { get; set; }

    [JsonProperty("card_type")]
    public string CardType { get; set; }

    [JsonProperty("trn_req_date")]
    public DateTime? TrnReqDate { get; set; }

    [JsonProperty("trn_approved")]
    public bool TrnApproved { get; set; }

    [JsonProperty("trn_date")]
    public DateTime? TrnDate { get; set; }

    [StringLength(10)]
    [JsonProperty("trn_id")]
    public string TrnId { get; set; }

    [StringLength(3)]
    [JsonProperty("trn_type")]
    public string TrnType { get; set; }
}