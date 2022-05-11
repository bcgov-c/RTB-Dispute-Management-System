using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OutcomeDocument;

public class OutcomeDocContentRequest
{
    [JsonProperty("content_sub_type")]
    public byte? ContentSubType { get; set; }

    [JsonProperty("content_status")]
    public byte? ContentStatus { get; set; }

    [JsonProperty("stored_content")]
    public string StoredContent { get; set; }
}

public class OutcomeDocContentPostRequest : OutcomeDocContentRequest
{
    [JsonProperty("content_type")]
    public byte ContentType { get; set; }
}

public class OutcomeDocContentPatchRequest : OutcomeDocContentRequest
{
}