using Newtonsoft.Json;

namespace CM.Business.Entities.Models.DisputeProcessDetail;

public class DisputeProcessDetailPostRequest : DisputeProcessDetailRequestBase
{
    [JsonProperty("associated_process")]
    public byte AssociatedProcess { get; set; }
}