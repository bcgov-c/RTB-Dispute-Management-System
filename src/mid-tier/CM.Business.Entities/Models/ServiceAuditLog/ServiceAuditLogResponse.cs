using System;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ServiceAuditLog
{
    public class ServiceAuditLogResponse
    {
        [JsonProperty("service_audit_log_id")]
        public int ServiceAuditLogId { get; set; }

        [JsonProperty("dispute_guid")]
        public Guid DisputeGuid { get; set; }

        [JsonProperty("service_type")]
        public ServiceType ServiceType { get; set; }

        [JsonProperty("file_package_service_id")]
        public int? FilePackageServiceId { get; set; }

        [JsonProperty("notice_service_id")]
        public int? NoticeServiceId { get; set; }

        [JsonProperty("service_change_type")]
        public ServiceChangeType? ServiceChangeType { get; set; }

        [JsonProperty("participant_id")]
        public int? ParticipantId { get; set; }

        [JsonProperty("other_participant_role")]
        public byte? OtherParticipantRole { get; set; }

        [JsonProperty("proof_file_description_id")]
        public int? ProofFileDescriptionId { get; set; }

        [JsonProperty("is_served")]
        public bool? IsServed { get; set; }

        [JsonProperty("service_method")]
        public ServiceMethod? ServiceMethod { get; set; }

        [JsonProperty("received_date")]
        public string ReceivedDate { get; set; }

        [JsonProperty("service_date_used")]
        public byte? ServiceDateUsed { get; set; }

        [JsonProperty("service_date")]
        public string ServiceDate { get; set; }

        [JsonProperty("served_by")]
        public int? ServiceBy { get; set; }

        [JsonProperty("validation_status")]
        public byte? ValidationStatus { get; set; }

        [JsonProperty("service_comment")]
        public string ServiceComment { get; set; }

        [JsonProperty("created_date")]
        public string CreatedDate { get; set; }

        [JsonProperty("created_by")]
        public int? CreatedBy { get; set; }

        [JsonProperty("other_proof_file_description_id")]
        public int? OtherProofFileDescriptionId { get; set; }

        [JsonProperty("service_description")]
        public string ServiceDescription { get; set; }
    }
}
