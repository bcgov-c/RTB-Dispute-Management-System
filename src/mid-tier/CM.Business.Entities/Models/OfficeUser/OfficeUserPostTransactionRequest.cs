using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OfficeUser;

public class OfficeUserPostTransactionRequest
{
    [Required]
    [JsonProperty("transaction_method")]
    public byte? TransactionMethod { get; set; }

    [StringLength(50)]
    [JsonProperty("office_payment_idir")]
    public string OfficePaymentIdir { get; set; }

    [StringLength(255)]
    [JsonProperty("payment_note")]
    public string PaymentNote { get; set; }

    [JsonProperty("transaction_by")]
    public int? TransactionBy { get; set; }

    [JsonProperty("transaction_amount")]
    public decimal TransactionAmount { get; set; }

    [JsonProperty("payment_status")]
    public byte PaymentStatus { get; set; }

    [JsonProperty("fee_waiver_tenants_family")]
    public byte? FeeWaiverTenantsFamily { get; set; }

    [JsonProperty("fee_waiver_income")]
    public decimal? FeeWaiverIncome { get; set; }

    [JsonProperty("fee_waiver_city_size")]
    public byte? FeeWaiverCitySize { get; set; }

    [JsonProperty("fee_waiver_hardship")]
    public bool? FeeWaiverHardship { get; set; }

    [StringLength(255)]
    [JsonProperty("fee_waiver_hardship_details")]
    public string FeeWaiverHardshipDetails { get; set; }
}