using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Dashboard;

public class DashboardSearchDisputesRequest
{
    [JsonProperty("stage_list")]
    public string StageList { get; set; }

    [JsonProperty("status_list")]
    public string StatusList { get; set; }

    [JsonProperty("process_list")]
    public string ProcessList { get; set; }

    [JsonProperty("sort_by_date_field")]
    public byte? SortByDateField { get; set; }

    [JsonProperty("dispute_urgency")]
    public byte? DisputeUrgency { get; set; }

    [JsonProperty("creation_method")]
    public byte? CreationMethod { get; set; }
}