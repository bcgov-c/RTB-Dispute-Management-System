﻿using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AdHocReport
{
    public class AdHocReportAttachmentResponse
    {
        [JsonProperty("adhoc_report_attachment_id")]
        public long AdHocReportAttachmentId { get; set; }

        [JsonProperty("adhoc_report_id")]
        public long AdHocReportId { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("query_for_name")]
        public string QueryForName { get; set; }

        [JsonProperty("query_for_attachment")]
        public string QueryForAttachment { get; set; }

        [JsonProperty("is_active")]
        public bool IsActive { get; set; }

        [JsonProperty("is_deleted")]
        public bool? IsDeleted { get; set; }
    }
}
