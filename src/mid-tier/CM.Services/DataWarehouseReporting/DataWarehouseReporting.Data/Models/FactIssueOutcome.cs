using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataWarehouseReporting.Data.Models
{
    public class FactIssueOutcome
    {
        [Key]
        public int IssueOutcomeRecordId { get; set; }

        public DateTime LoadDateTime { get; set; }

        public int AssociatedOffice { get; set; }

        public bool IsActive { get; set; }

        public bool IsPublic { get; set; }

        public Guid DisputeGuid { get; set; }

        public int? ClaimGroupId { get; set; }

        public int? ClaimId { get; set; }

        public DateTime? ClaimCreatedDate { get; set; }

        public DateTime? AwardDate { get; set; }

        public int? AwardedBy { get; set; }

        public int? ClaimCode { get; set; }

        public bool? IsAmended { get; set; }

        public int? RemedyStatus { get; set; }

        public int? RemedySubStatus { get; set; }

        public decimal? RequestedAmount { get; set; }

        public decimal? AwardedAmount { get; set; }

        public DateTime? AwardedDate { get; set; }

        public int? AwardedDaysAfterService { get; set; }

        public bool? IsReviewed { get; set; }

        public int? PrevRemedyStatus { get; set; }

        public DateTime? PrevAwardDate { get; set; }

        public int? PrevAwardedBy { get; set; }

        public DateTime? PrevAwardedDate { get; set; }

        public int? PrevAwardedDaysAfterService { get; set; }

        public decimal? PrevAwardedAmount { get; set; }

        public int? DisputeUrgency { get; set; }

        public int? DisputeCreationMethod { get; set; }

        public int? DisputeType { get; set; }

        public int? DisputeSubType { get; set; }

        public DateTime? SubmittedDateTime { get; set; }

        public DateTime? InitialPaymentDateTime { get; set; }

        public int? InitialPaymentMethod { get; set; }
    }
}
