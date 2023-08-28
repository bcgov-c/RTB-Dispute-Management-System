using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Entities
{
    public class AdHocGetFilter
    {
        [JsonProperty("report_type")]
        public ReportType[] ReportType { get; set; }

        [JsonProperty("report_sub_type")]
        public ReportSubType[] ReportSubType { get; set; }

        [JsonProperty("report_user_group")]
        public byte?[] ReportUserGroup { get; set; }

        [JsonProperty("target_database")]
        public TargetDatabase?[] TargetDatabase { get; set; }

        [JsonProperty("is_active")]
        public bool? IsActive { get; set; }
    }
}
