using System;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ExternalErrorLog
{
    public class ExternalErrorLogResponse : CommonResponse
    {
        [JsonProperty("exteral_error_log_id")]
        public int ExternalErrorLogId { get; set; }

        [JsonProperty("error_site")]
        public byte ErrorSite { get; set; }

        [JsonProperty("dispute_guid")]
        public Guid? DisputeGuid { get; set; }

        [JsonProperty("error_severity")]
        public byte? ErrorSeverity { get; set; }

        [JsonProperty("error_impact")]
        public byte? ErrorImpact { get; set; }

        [JsonProperty("error_urgency")]
        public byte? ErrorUrgency { get; set; }

        [JsonProperty("error_type")]
        public byte ErrorType { get; set; }

        [JsonProperty("error_subtype")]
        public byte? ErrorSubType { get; set; }

        [JsonProperty("error_status")]
        public byte? ErrorStatus { get; set; }

        [JsonProperty("error_owner")]
        public int? ErrorOwner { get; set; }

        [JsonProperty("reported_date")]
        public DateTime? ReportedDate { get; set; }

        [JsonProperty("error_title")]
        public string ErrorTitle { get; set; }

        [JsonProperty("feature_title")]
        public string FeatureTitle { get; set; }

        [JsonProperty("error_details")]
        public string ErrorDetails { get; set; }

        [JsonProperty("error_comment")]
        public string ErrorComment { get; set; }
    }
}
