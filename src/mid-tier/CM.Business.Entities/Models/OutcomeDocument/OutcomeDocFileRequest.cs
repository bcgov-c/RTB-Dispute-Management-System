using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OutcomeDocument;

public class OutcomeDocFileRequest
{
    [JsonProperty("file_status")]
    public byte? FileStatus { get; set; }

    [JsonProperty("file_sub_status")]
    public byte? FileSubStatus { get; set; }

    [StringLength(100)]
    [JsonProperty("file_title")]
    public string FileTitle { get; set; }

    [StringLength(5)]
    [JsonProperty("file_acronym")]
    public string FileAcronym { get; set; }

    [StringLength(500)]
    [JsonProperty("file_description")]
    public string FileDescription { get; set; }

    [JsonProperty("file_source")]
    public byte? FileSource { get; set; }

    [StringLength(500)]
    [JsonProperty("internal_file_comment")]
    public string InternalFileComment { get; set; }

    [JsonProperty("file_id")]
    public int? FileId { get; set; }

    [JsonProperty("visible_to_public")]
    public bool? VisibleToPublic { get; set; }

    [JsonProperty("note_worthy")]
    public bool? NoteWorthy { get; set; }

    [JsonProperty("materially_different")]
    public bool? MateriallyDifferent { get; set; }

    [JsonProperty("file_sub_type")]
    public byte? FileSubType { get; set; }
}

public class OutcomeDocFilePostRequest : OutcomeDocFileRequest
{
    [JsonProperty("dispute_guid")]
    [Required]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("file_type")]
    public byte FileType { get; set; }
}

public class OutcomeDocFilePatchRequest : OutcomeDocFileRequest
{
}