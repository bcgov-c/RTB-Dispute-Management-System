using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OutcomeDocument.Reporting;

public class OutcomeDocDeliveryReportFullResponse
{
    public OutcomeDocDeliveryReportFullResponse()
    {
        OutcomeDocDeliveries = new List<OutcomeDocDeliveryReportResponse>();
    }

    [JsonProperty("total_available_records")]
    public int TotalAvailableRecords { get; set; }

    [JsonProperty("outcome_doc_deliveries")]
    public List<OutcomeDocDeliveryReportResponse> OutcomeDocDeliveries { get; set; }
}