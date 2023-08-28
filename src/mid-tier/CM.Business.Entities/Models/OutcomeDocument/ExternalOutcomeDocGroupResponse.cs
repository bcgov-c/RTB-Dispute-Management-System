using System;
using System.Collections.Generic;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OutcomeDocument
{
    public class ExternalOutcomeDocGroupResponse : CommonResponse
    {
        [JsonProperty("outcome_doc_group_id")]
        public int OutcomeDocGroupId { get; set; }

        [JsonProperty("dispute_guid")]
        public Guid DisputeGuid { get; set; }

        [JsonProperty("doc_group_type")]
        public byte DocGroupType { get; set; }

        [JsonProperty("doc_group_sub_type")]
        public byte? DocGroupSubType { get; set; }

        [JsonProperty("doc_completed_date")]
        public string DocCompletedDate { get; set; }

        [JsonProperty("doc_status")]
        public byte? DocStatus { get; set; }

        [JsonProperty("doc_status_date")]
        public string DocStatusDate { get; set; }

        [JsonProperty("doc_complexity")]
        public byte? DocComplexity { get; set; }

        [JsonProperty("doc_version")]
        public byte? DocVersion { get; set; }

        [JsonProperty("outcome_doc_files")]
        public ICollection<ExternalOutcomeDocFileResponse> OutcomeDocFiles { get; set; }
    }
}
