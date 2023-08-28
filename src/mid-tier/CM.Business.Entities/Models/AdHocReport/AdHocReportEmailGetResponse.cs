﻿using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AdHocReport
{
    public class AdHocReportEmailGetResponse : AdHocReportEmailResponse
    {
        public AdHocReportEmailGetResponse()
        {
            AdhocReportAttachments = new List<AdHocReportAttachmentResponse>();
        }

        [JsonProperty("adhoc_report_attachments")]
        public List<AdHocReportAttachmentResponse> AdhocReportAttachments { get; set; }
    }
}