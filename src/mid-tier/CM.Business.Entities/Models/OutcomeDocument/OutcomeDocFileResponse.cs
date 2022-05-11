using System;
using System.Collections.Generic;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OutcomeDocument;

public class OutcomeDocFileResponse : CommonResponse
{
    [JsonProperty("outcome_doc_file_id")]
    public int OutcomeDocFileId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("outcome_doc_group_id")]
    public int OutcomeDocGroupId { get; set; }

    [JsonProperty("file_type")]
    public byte FileType { get; set; }

    [JsonProperty("file_status")]
    public byte? FileStatus { get; set; }

    [JsonProperty("file_sub_status")]
    public byte? FileSubStatus { get; set; }

    [JsonProperty("visible_to_public")]
    public bool? VisibleToPublic { get; set; }

    [JsonProperty("note_worthy")]
    public bool? NoteWorthy { get; set; }

    [JsonProperty("materially_different")]
    public bool? MateriallyDifferent { get; set; }

    [JsonProperty("file_title")]
    public string FileTitle { get; set; }

    [JsonProperty("file_acronym")]
    public string FileAcronym { get; set; }

    [JsonProperty("file_description")]
    public string FileDescription { get; set; }

    [JsonProperty("file_source")]
    public byte? FileSource { get; set; }

    [JsonProperty("file_id")]
    public int? FileId { get; set; }

    [JsonProperty("internal_file_comment")]
    public string InternalFileComment { get; set; }

    [JsonProperty("file_sub_type")]
    public byte? FileSubType { get; set; }
}

public class OutcomeDocFileFullResponse : OutcomeDocFileResponse
{
    [JsonProperty("outcome_doc_contents")]
    public ICollection<OutcomeDocContentResponse> OutcomeDocContents { get; set; }

    [JsonProperty("outcome_doc_deliveries")]
    public ICollection<OutcomeDocDeliveryResponse> OutcomeDocDeliveries { get; set; }
}