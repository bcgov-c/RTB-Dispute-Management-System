﻿using Newtonsoft.Json;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Entities
{
    public class CommonResponse
    {
        [JsonProperty("created_date")]
        public string CreatedDate { get; set; }

        [JsonProperty("created_by")]
        public int CreatedBy { get; set; }

        [JsonProperty("modified_date")]
        public string ModifiedDate { get; set; }

        [JsonProperty("modified_by")]
        public int ModifiedBy { get; set; }
    }
}
