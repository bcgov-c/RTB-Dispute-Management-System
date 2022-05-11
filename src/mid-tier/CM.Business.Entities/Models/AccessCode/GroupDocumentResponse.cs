using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AccessCode;

public class GroupDocumentResponse
{
    [JsonProperty("outcome_doc_file_id")]
    public int OutcomeDocFileId { get; set; }

    [JsonProperty("file_id")]
    public int FileId { get; set; }

    [JsonProperty("file_type")]
    public byte FileType { get; set; }

    [JsonProperty("file_title")]
    public string FileTitle { get; set; }

    [JsonProperty("file_acronym")]
    public string FileAcronym { get; set; }
}