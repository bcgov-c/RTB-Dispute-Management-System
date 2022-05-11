using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OutcomeDocRequest;

public class OutcomeDocRequestGetResponse : OutcomeDocRequestResponse
{
    public OutcomeDocRequestGetResponse()
    {
        OutcomeDocReqItems = new List<OutcomeDocRequestItemResponse>();
    }

    [JsonProperty("outcome_document_req_items")]
    public List<OutcomeDocRequestItemResponse> OutcomeDocReqItems { get; set; }
}