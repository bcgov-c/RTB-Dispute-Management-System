using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Note;

public class NotePatchRequest
{
    [JsonProperty("note")]
    [StringLength(1500, MinimumLength = 5)]
    public string NoteContent { get; set; }
}