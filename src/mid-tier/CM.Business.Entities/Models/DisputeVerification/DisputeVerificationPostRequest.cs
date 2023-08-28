using System;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.DisputeVerification
{
    public class DisputeVerificationPostRequest
    {
        [JsonProperty("hearing_id")]
        public int? HearingId { get; set; }

        [JsonProperty("dispute_fee_id")]
        public int? DisputeFeeId { get; set; }

        [JsonProperty("verification_type")]
        public DisputeVerificationType VerificationType { get; set; }

        [JsonProperty("verification_status_date")]
        public DateTime? VerificationStatusDate { get; set; }

        [JsonProperty("verification_sub_status")]
        public byte? VerificationSubStatus { get; set; }

        [JsonProperty("is_refund_included")]
        public bool? IsRefundIncluded { get; set; }

        [JsonProperty("refund_status")]
        public RefundStatus? RefundStatus { get; set; }

        [JsonProperty("refund_initiated_date")]
        public DateTime? RefundInitiatedDate { get; set; }

        [JsonProperty("refund_initiated_by")]
        public int? RefundInitiatedBy { get; set; }

        [JsonProperty("refund_note")]
        public string RefundNote { get; set; }
    }
}
