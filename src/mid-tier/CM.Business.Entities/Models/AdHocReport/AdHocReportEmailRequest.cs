using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AdHocReport
{
    public class AdHocReportEmailRequest
    {
        [JsonProperty("report_type")]
        public ReportType? ReportType { get; set; }

        [JsonProperty("report_sub_type")]
        public ReportSubType? ReportSubType { get; set; }

        [JsonProperty("report_user_group")]
        public byte? ReportUserGroup { get; set; }

        [JsonProperty("email_subject")]
        [Required]
        [MinLength(5)]
        public string EmailSubject { get; set; }

        [JsonProperty("email_body")]
        [Required]
        [MinLength(50)]
        public string EmailBody { get; set; }

        [JsonProperty("email_from")]
        [Required]
        [DataType(DataType.EmailAddress)]
        public string EmailFrom { get; set; }

        [JsonProperty("email_to")]
        [Required]
        [DataType(DataType.EmailAddress)]
        public string EmailTo { get; set; }

        [JsonProperty("cron_job")]
        [Required]
        [MinLength(8)]
        public string CronJob { get; set; }
    }
}
