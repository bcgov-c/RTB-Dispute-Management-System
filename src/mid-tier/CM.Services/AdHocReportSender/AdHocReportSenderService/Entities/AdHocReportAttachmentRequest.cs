﻿using Newtonsoft.Json;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Entities
{
    public class AdHocReportAttachmentRequest
    {
        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("query_for_name")]
        public string QueryForName { get; set; }

        [JsonProperty("query_for_attachment")]
        public string QueryForAttachment { get; set; }

        [JsonProperty("excel_template_exists")]
        public bool? ExcelTemplateExists { get; set; }

        [JsonProperty("excel_template_id")]
        public int? ExcelTemplateId { get; set; }
    }
}
