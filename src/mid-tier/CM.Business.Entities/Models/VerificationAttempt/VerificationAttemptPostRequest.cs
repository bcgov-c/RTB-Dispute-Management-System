using System;
using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.VerificationAttempt
{
    public class VerificationAttemptPostRequest
    {
        [JsonProperty("participant_id")]
        public int ParticipantId { get; set; }

        [JsonProperty("participant_role")]
        public ParticipantRole ParticipantRole { get; set; }

        [JsonProperty("attempt_method")]
        public AttemptMethod? AttemptMethod { get; set; }

        [JsonProperty("attempt_start_date_time")]
        public DateTime? AttemptStartDateTime { get; set; }

        [JsonProperty("attempt_end_date_time")]
        public DateTime? AttemptEndDateTime { get; set; }

        [JsonProperty("verification_date")]
        public DateTime? VerificationDate { get; set; }

        [JsonProperty("verification_outcome")]
        public VerificationOutcome? VerificationOutcome { get; set; }

        [JsonProperty("verification_refund_requested")]
        public bool? VerificationRefundRequested { get; set; }

        [JsonProperty("verification_reason")]
        public VerificationReason? VerificationReason { get; set; }

        [JsonProperty("verification_name")]
        [StringLength(150, MinimumLength = 5)]
        public string VerificationName { get; set; }

        [JsonProperty("verification_address")]
        [StringLength(300, MinimumLength = 5)]
        public string VerificationAddress { get; set; }

        [JsonProperty("verifciation_phone")]
        [StringLength(15, MinimumLength = 5)]
        public string VerificationPhone { get; set; }

        [JsonProperty("verification_email")]
        [StringLength(100, MinimumLength = 5)]
        public string VerificationEmail { get; set; }

        [JsonProperty("verification_payment_details")]
        [StringLength(int.MaxValue, MinimumLength = 5)]
        public string VerificationPaymentDetail { get; set; }

        [JsonProperty("verification_note")]
        [StringLength(500, MinimumLength = 5)]
        public string VerificationNote { get; set; }
    }
}
