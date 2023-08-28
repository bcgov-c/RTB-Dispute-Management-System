using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CM.Data.Model
{
    public class ExternalErrorLog : BaseEntity
    {
        public int ExternalErrorLogId { get; set; }

        [Required]
        public byte ErrorSite { get; set; }

        public Guid? DisputeGuid { get; set; }

        public Dispute Dispute { get; set; }

        public byte? ErrorSeverity { get; set; }

        public byte? ErrorImpact { get; set; }

        public byte? ErrorUrgency { get; set; }

        [Required]
        public byte ErrorType { get; set; }

        public byte? ErrorSubType { get; set; }

        public byte? ErrorStatus { get; set; }

        public int? ErrorOwner { get; set; }

        public SystemUser ErrorOwnerUser { get; set; }

        public DateTime? ReportedDate { get; set; }

        [StringLength(150)]
        [Required]
        public string ErrorTitle { get; set; }

        [StringLength(150)]
        public string FeatureTitle { get; set; }

        [StringLength(2500)]
        [Required]
        public string ErrorDetails { get; set; }

        [StringLength(500)]
        public string ErrorComment { get; set; }

        public bool IsDeleted { get; set; }
    }
}
