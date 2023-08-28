using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AdHocReport
{
    public class AdHocReportEmailResponse
    {
        [JsonProperty("adhoc_report_id")]
        public long AdHocReportId { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("report_type")]
        public ReportType? ReportType { get; set; }

        [JsonProperty("report_sub_type")]
        public ReportSubType? ReportSubType { get; set; }

        [JsonProperty("report_user_group")]
        public byte? ReportUserGroup { get; set; }

        [JsonProperty("is_active")]
        public bool IsActive { get; set; }

        [JsonProperty("is_deleted")]
        public bool? IsDeleted { get; set; }

        [JsonProperty("email_subject")]
        public string EmailSubject { get; set; }

        [JsonProperty("email_body")]
        public string EmailBody { get; set; }

        [JsonProperty("email_from")]
        public string EmailFrom { get; set; }

        [JsonProperty("email_to")]
        public string EmailTo { get; set; }

        [JsonProperty("cron_job")]
        public string CronJob { get; set; }
    }
}
