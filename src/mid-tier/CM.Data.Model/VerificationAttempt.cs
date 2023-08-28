using System;
using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;

namespace CM.Data.Model
{
    public class VerificationAttempt : BaseEntity
    {
        public int VerificationAttemptId { get; set; }

        public int DisputeVerificationId { get; set; }

        public DisputeVerification DisputeVerification { get; set; }

        public int ParticipantId { get; set; }

        public Participant Participant { get; set; }

        public ParticipantRole ParticipantRole { get; set; }

        public AttemptMethod? AttemptMethod { get; set; }

        public DateTime? AttemptStartDateTime { get; set; }

        public DateTime? AttemptEndDateTime { get; set; }

        public DateTime? VerificationDate { get; set; }

        public VerificationOutcome? VerificationOutcome { get; set; }

        public bool? VerificationRefundRequested { get; set; }

        public VerificationReason? VerificationReason { get; set; }

        [StringLength(150)]
        public string VerificationName { get; set; }

        [StringLength(300)]
        public string VerificationAddress { get; set; }

        [StringLength(15)]
        public string VerificationPhone { get; set; }

        [StringLength(100)]
        public string VerificationEmail { get; set; }

        [StringLength(int.MaxValue, MinimumLength = 5)]
        public string VerificationPaymentDetail { get; set; }

        [StringLength(500)]
        public string VerificationNote { get; set; }

        public bool? IsDeleted { get; set; }
    }
}
