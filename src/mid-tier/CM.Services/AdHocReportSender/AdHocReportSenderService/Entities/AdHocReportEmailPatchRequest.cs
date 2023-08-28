using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Entities
{
    public class AdHocReportEmailPatchRequest
    {
        [JsonProperty("email_subject")]
        [MinLength(5)]
        public string EmailSubject { get; set; }

        [JsonProperty("email_body")]
        [MinLength(50)]
        public string EmailBody { get; set; }

        [JsonProperty("email_from")]
        [DataType(DataType.EmailAddress)]
        public string EmailFrom { get; set; }

        [JsonProperty("email_to")]
        [DataType(DataType.EmailAddress)]
        public string EmailTo { get; set; }

        [JsonProperty("cron_job")]
        [MinLength(8)]
        public string CronJob { get; set; }

        [JsonProperty("is-active")]
        public bool? IsActive { get; set; }
    }
}
