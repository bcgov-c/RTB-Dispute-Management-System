using System;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Note;

public class NoteResponse : CommonResponse
{
    [JsonProperty("note_id")]
    public int NoteId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("note_status")]
    public byte NoteStatus { get; set; }

    [JsonProperty("note_type")]
    public byte NoteType { get; set; }

    [JsonProperty("note_linked_to")]
    public byte NoteLinkedTo { get; set; }

    [JsonProperty("note_link_id")]
    public int? NoteLinkId { get; set; }

    [JsonProperty("note")]
    public string NoteContent { get; set; }

    [JsonProperty("creator_group_role_id")]
    public byte? CreatorGroupRoleId { get; set; }
}