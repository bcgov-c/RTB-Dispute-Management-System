using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Notice;

public class NoticePostRequest : NoticePatchRequest
{
    [JsonProperty("is_initial_dispute_notice")]
    public bool? IsInitialDisputeNotice { get; set; }
}