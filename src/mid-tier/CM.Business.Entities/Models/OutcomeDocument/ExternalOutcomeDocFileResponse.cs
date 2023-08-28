using System;
using System.Collections.Generic;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OutcomeDocument
{
    public class ExternalOutcomeDocFileResponse : CommonResponse
    {
        [JsonProperty("outcome_doc_file_id")]
        public int OutcomeDocFileId { get; set; }

        [JsonProperty("dispute_guid")]
        public Guid DisputeGuid { get; set; }

        [JsonProperty("outcome_doc_group_id")]
        public int OutcomeDocGroupId { get; set; }

        [JsonProperty("file_type")]
        public byte FileType { get; set; }

        [JsonProperty("file_sub_type")]
        public byte? FileSubType { get; set; }

        [JsonProperty("file_status")]
        public byte? FileStatus { get; set; }

        [JsonProperty("file_sub_status")]
        public byte? FileSubStatus { get; set; }

        [JsonProperty("visible_to_public")]
        public bool? VisibleToPublic { get; set; }

        [JsonProperty("file_id")]
        public int? FileId { get; set; }

        [JsonProperty("outcome_doc_deliveries")]
        public ICollection<ExternalOutcomeDocDeliveryResponse> OutcomeDocDeliveries { get; set; }
    }
}
