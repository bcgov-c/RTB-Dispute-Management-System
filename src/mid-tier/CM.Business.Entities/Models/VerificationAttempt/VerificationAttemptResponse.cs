using System;
using System.ComponentModel.DataAnnotations;
using CM.Business.Entities.Models.Base;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.VerificationAttempt
{
    public class VerificationAttemptResponse : CommonResponse
    {
        [JsonProperty("verification_attempt_id")]
        public int VerificationAttemptId { get; set; }

        [JsonProperty("participant_id")]
        public int ParticipantId { get; set; }

        [JsonProperty("participant_role")]
        public ParticipantRole ParticipantRole { get; set; }

        [JsonProperty("attempt_method")]
        public AttemptMethod? AttemptMethod { get; set; }

        [JsonProperty("attempt_start_date_time")]
        public string AttemptStartDateTime { get; set; }

        [JsonProperty("attempt_end_date_time")]
        public string AttemptEndDateTime { get; set; }

        [JsonProperty("verification_date")]
        public string VerificationDate { get; set; }

        [JsonProperty("verification_outcome")]
        public VerificationOutcome? VerificationOutcome { get; set; }

        [JsonProperty("verification_refund_requested")]
        public bool? VerificationRefundRequested { get; set; }

        [JsonProperty("verification_reason")]
        public VerificationReason? VerificationReason { get; set; }

        [JsonProperty("verification_name")]
        public string VerificationName { get; set; }

        [JsonProperty("verification_address")]
        public string VerificationAddress { get; set; }

        [JsonProperty("verifciation_phone")]
        public string VerificationPhone { get; set; }

        [JsonProperty("verification_email")]
        public string VerificationEmail { get; set; }

        [JsonProperty("verification_payment_details")]
        public string VerificationPaymentDetail { get; set; }

        [JsonProperty("verification_note")]
        public string VerificationNote { get; set; }
    }
}
