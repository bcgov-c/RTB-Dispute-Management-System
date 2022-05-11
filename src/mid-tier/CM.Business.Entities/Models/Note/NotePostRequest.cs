using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Note;

public class NotePostRequest
{
    [JsonProperty("note_status")]
    public byte NoteStatus { get; set; }

    [JsonProperty("note_type")]
    public byte NoteType { get; set; }

    [JsonProperty("note_linked_to")]
    public byte NoteLinkedTo { get; set; }

    [JsonProperty("note_link_id")]
    public int? NoteLinkId { get; set; }

    [JsonProperty("note")]
    [StringLength(1500, MinimumLength = 5)]
    public string NoteContent { get; set; }
}