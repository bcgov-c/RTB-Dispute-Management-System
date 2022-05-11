using System;

namespace CM.Data.Repositories.Search;

public class DisputeNoteOwnersSearch : DisputeSearch
{
    public int NoteId { get; set; }

    public DateTime? NoteCreatedDate { get; set; }
}