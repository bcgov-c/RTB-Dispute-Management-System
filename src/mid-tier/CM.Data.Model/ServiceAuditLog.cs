using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CM.Common.Utilities;

namespace CM.Data.Model
{
    public class ServiceAuditLog : BaseEntity
    {
        public int ServiceAuditLogId { get; set; }

        public Dispute Dispute { get; set; }

        public Guid DisputeGuid { get; set; }

        public ServiceType ServiceType { get; set; }

        public int? FilePackageServiceId { get; set; }

        public FilePackageService FilePackageService { get; set; }

        public int? NoticeServiceId { get; set; }

        public NoticeService NoticeService { get; set; }

        public ServiceChangeType? ServiceChangeType { get; set; }

        [ForeignKey("Participant")]
        public int? ParticipantId { get; set; }

        public Participant Participant { get; set; }

        public byte? OtherParticipantRole { get; set; }

        [ForeignKey("ProofFileDescription")]
        public int? ProofFileDescriptionId { get; set; }

        public FileDescription ProofFileDescription { get; set; }

        [ForeignKey("OtherProofFileDescription")]
        public int? OtherProofFileDescriptionId { get; set; }

        public FileDescription OtherProofFileDescription { get; set; }

        public bool? IsServed { get; set; }

        public ServiceMethod? ServiceMethod { get; set; }

        public DateTime? ReceivedDate { get; set; }

        public byte? ServiceDateUsed { get; set; }

        public DateTime? ServiceDate { get; set; }

        [ForeignKey("Served")]
        public int? ServiceBy { get; set; }

        public Participant Served { get; set; }

        public byte? ValidationStatus { get; set; }

        [StringLength(255)]
        public string ServiceComment { get; set; }

        [StringLength(500)]
        public string ServiceDescription { get; set; }
    }
}
