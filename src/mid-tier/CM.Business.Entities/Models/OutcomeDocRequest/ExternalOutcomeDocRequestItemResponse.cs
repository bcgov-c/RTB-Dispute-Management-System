using CM.Business.Entities.Models.Base;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OutcomeDocRequest
{
    public class ExternalOutcomeDocRequestItemResponse : CommonResponse
    {
        [JsonProperty("outcome_doc_req_item_id")]
        public int OutcomeDocReqItemId { get; set; }

        [JsonProperty("outcome_doc_request_id")]
        public int OutcomeDocRequestId { get; set; }

        [JsonProperty("item_type")]
        public OutcomeDocRequestItemType ItemType { get; set; }

        [JsonProperty("item_sub_type")]
        public OutcomeDocRequestItemSubType? ItemSubType { get; set; }

        [JsonProperty("item_status")]
        public byte? ItemStatus { get; set; }

        [JsonProperty("item_title")]
        public string ItemTitle { get; set; }

        [JsonProperty("file_description_id")]
        public int? FileDescriptionId { get; set; }
    }
}
