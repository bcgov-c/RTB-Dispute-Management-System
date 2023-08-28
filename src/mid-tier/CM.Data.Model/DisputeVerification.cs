using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;

namespace CM.Data.Model
{
    public class DisputeVerification : BaseEntity
    {
        [Key]
        public int VerificationId { get; set; }

        public Guid DisputeGuid { get; set; }

        public Dispute Dispute { get; set; }

        public int? HearingId { get; set; }

        public Hearing Hearing { get; set; }

        public int? DisputeFeeId { get; set; }

        public DisputeFee DisputeFee { get; set; }

        public DisputeVerificationType VerificationType { get; set; }

        public VerificationStatus? VerificationStatus { get; set; }

        public DateTime? VerificationStatusDate { get; set; }

        public byte? VerificationSubStatus { get; set; }

        public bool? IsRefundIncluded { get; set; }

        public RefundStatus? RefundStatus { get; set; }

        public DateTime? RefundInitiatedDate { get; set; }

        public int? RefundInitiatedBy { get; set; }

        public SystemUser RefundInitiated { get; set; }

        public string RefundNote { get; set; }

        public bool? IsDeleted { get; set; }

        public virtual ICollection<VerificationAttempt> VerificationAttempts { get; set; }
    }
}
