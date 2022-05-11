using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AccessCode;

public class DisputeOutcomeDocGroupResponse
{
    [JsonProperty("outcome_doc_group_id")]
    public int OutcomeDocGroupId { get; set; }

    [JsonProperty("doc_completed_date")]
    public string DocCompletedDate { get; set; }

    [JsonProperty("associated_id")]
    public int? AssociatedId { get; set; }

    [JsonProperty("associated_role_group_id")]
    public int AssociatedRoleGroupId { get; set; }

    [JsonProperty("outcome_doc_files")]
    public List<GroupDocumentResponse> OutcomeDocFiles { get; set; }
}