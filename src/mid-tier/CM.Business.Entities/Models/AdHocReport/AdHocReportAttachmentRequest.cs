using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AdHocReport
{
    public class AdHocReportAttachmentRequest
    {
        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("query_for_name")]
        public string QueryForName { get; set; }

        [JsonProperty("query_for_attachment")]
        public string QueryForAttachment { get; set; }
    }
}
