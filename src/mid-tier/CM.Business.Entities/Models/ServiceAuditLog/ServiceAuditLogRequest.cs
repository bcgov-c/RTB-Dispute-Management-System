using System;
using CM.Common.Utilities;

namespace CM.Business.Entities.Models.ServiceAuditLog
{
    public class ServiceAuditLogRequest
    {
        public Guid DisputeGuid { get; set; }

        public ServiceType ServiceType { get; set; }

        public int? FilePackageServiceId { get; set; }

        public int? NoticeServiceId { get; set; }

        public ServiceChangeType? ServiceChangeType { get; set; }

        public int? ParticipantId { get; set; }

        public byte? OtherParticipantRole { get; set; }

        public int? ProofFileDescriptionId { get; set; }

        public bool? IsServed { get; set; }

        public DateTime? ServiceDate { get; set; }

        public int? ServiceBy { get; set; }

        public byte? ValidationStatus { get; set; }

        public int? OtherProofFileDescriptionId { get; set; }

        public string ServiceDescription { get; set; }
    }
}
