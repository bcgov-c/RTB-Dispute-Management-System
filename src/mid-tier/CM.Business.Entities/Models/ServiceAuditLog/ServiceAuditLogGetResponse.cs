using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ServiceAuditLog
{
    public class ServiceAuditLogGetResponse
    {
        public ServiceAuditLogGetResponse()
        {
            ServiceAuditLogs = new List<ServiceAuditLogResponse>();
        }

        [JsonProperty("service_audit_logs")]
        public List<ServiceAuditLogResponse> ServiceAuditLogs { get; set; }

        [JsonProperty("total_available_records")]
        public int TotalCount { get; set; }
    }
}
