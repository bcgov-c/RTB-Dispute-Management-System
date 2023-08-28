using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ServiceAuditLog
{
    public class ServiceAuditLogGetRequest
    {
        [JsonProperty("service_type")]
        public ServiceType? ServiceType { get; set; }

        [JsonProperty("file_package_service_id")]
        public int? FilePackageServiceId { get; set; }

        [JsonProperty("notice_service_id")]
        public int? NoticeServiceId { get; set; }

        [JsonProperty("service_change_type")]
        public ServiceChangeType[] ServiceChangeType { get; set; }

        [JsonProperty("participant_id")]
        public int? ParticipantId { get; set; }
    }
}
