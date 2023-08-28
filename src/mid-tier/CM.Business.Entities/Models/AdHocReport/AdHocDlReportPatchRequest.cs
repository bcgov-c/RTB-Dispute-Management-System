using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AdHocReport
{
    public class AdHocDlReportPatchRequest
    {
        [JsonProperty("title")]
        [MinLength(4)]
        public string Title { get; set; }

        [JsonProperty("description")]
        [MinLength(20)]
        public string Description { get; set; }

        [JsonProperty("query_for_name")]
        [MinLength(10)]
        public string QueryForName { get; set; }

        [JsonProperty("query_for_report")]
        [MinLength(50)]
        public string QueryForReport { get; set; }

        [JsonProperty("report_type")]
        public byte Type { get; set; }

        [JsonProperty("excel_template_exists")]
        public bool? ExcelTemplateExists { get; set; }

        [JsonProperty("excel_template_id")]
        public int? ExcelTemplateId { get; set; }

        [JsonProperty("target_database")]
        public byte? TargetDatabase { get; set; }

        [JsonProperty("report_sub_type")]
        public byte? SubType { get; set; }

        [JsonProperty("user_group")]
        public byte? ReportUserGroup { get; set; }
    }
}
