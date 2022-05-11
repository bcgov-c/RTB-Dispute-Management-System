using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OfficeUser;

public class OfficeUserPatchDisputeResponse
{
    [JsonProperty("dispute_urgency")]
    public byte? DisputeUrgency { get; set; }

    [JsonProperty("dispute_complexity")]
    public DisputeComplexity? DisputeComplexity { get; set; }

    [JsonProperty("original_notice_delivered")]
    public bool? OriginalNoticeDelivered { get; set; }

    [JsonProperty("original_notice_date")]
    public string OriginalNoticeDate { get; set; }

    [JsonProperty("initial_payment_date")]
    public string InitialPaymentDate { get; set; }

    [JsonProperty("initial_payment_by")]
    public int? InitialPaymentBy { get; set; }

    [JsonProperty("submitted_date")]
    public string SubmittedDate { get; set; }

    [JsonProperty("submitted_by")]
    public int? SubmittedBy { get; set; }

    [JsonProperty("tenancy_address_validated")]
    public byte? TenancyAddressValidated { get; set; }
}