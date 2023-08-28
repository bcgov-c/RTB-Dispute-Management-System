using Newtonsoft.Json;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Entities
{
    public class AdHocReportGetFilter
    {
        [JsonProperty("report_type")]
        public byte?[] ReportType { get; set; }

        [JsonProperty("report_sub_type")]
        public byte?[] ReportSubType { get; set; }

        [JsonProperty("report_user_group")]
        public byte?[] ReportUserGroup { get; set; }

        [JsonProperty("is_active")]
        public bool? IsActive { get; set; }
    }
}
