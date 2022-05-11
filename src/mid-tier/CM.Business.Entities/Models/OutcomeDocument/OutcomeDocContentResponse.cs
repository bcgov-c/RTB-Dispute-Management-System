using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OutcomeDocument;

public class OutcomeDocContentResponse : CommonResponse
{
    [JsonProperty("custom_content_id")]
    public int OutcomeDocContentId { get; set; }

    [JsonProperty("outcome_doc_file_id")]
    public int OutcomeDocFileId { get; set; }

    [JsonProperty("content_type")]
    public byte ContentType { get; set; }

    [JsonProperty("content_sub_type")]
    public byte? ContentSubType { get; set; }

    [JsonProperty("content_status")]
    public byte? ContentStatus { get; set; }

    [JsonProperty("stored_content")]
    public string StoredContent { get; set; }
}