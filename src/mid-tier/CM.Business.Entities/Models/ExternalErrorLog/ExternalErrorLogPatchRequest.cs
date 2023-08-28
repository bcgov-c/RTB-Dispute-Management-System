using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ExternalErrorLog
{
    public class ExternalErrorLogPatchRequest
    {
        [JsonProperty("error_severity")]
        public byte? ErrorSeverity { get; set; }

        [JsonProperty("error_impact")]
        public byte? ErrorImpact { get; set; }

        [JsonProperty("error_urgency")]
        public byte? ErrorUrgency { get; set; }

        [JsonProperty("error_status")]
        public byte? ErrorStatus { get; set; }

        [JsonProperty("error_owner")]
        public int? ErrorOwner { get; set; }

        [JsonProperty("reported_date")]
        public DateTime? ReportedDate { get; set; }

        [JsonProperty("error_comment")]
        public string ErrorComment { get; set; }
    }
}
