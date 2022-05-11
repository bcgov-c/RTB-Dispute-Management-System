using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Search;

public class DisputeNoteOwnerSearchRequest
{
    [JsonProperty("owned_by")]
    public int[] OwnedBy { get; set; }

    [JsonProperty("note_linked_to")]
    public int[] NoteLinkedTo { get; set; }

    [JsonProperty("creator_group_role_id")]
    public int[] CreatorGroupRoleId { get; set; }

    [JsonProperty("created_date_greater_than")]
    public DateTime? CreatedDateGreaterThan { get; set; }

    [JsonProperty("created_date_less_than")]
    public DateTime? CreatedDateLessThan { get; set; }
}