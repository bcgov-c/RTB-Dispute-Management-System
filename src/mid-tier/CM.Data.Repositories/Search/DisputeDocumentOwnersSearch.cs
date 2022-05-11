using System;

namespace CM.Data.Repositories.Search;

public class DisputeDocumentOwnersSearch : DisputeSearch
{
    public int OutcomeDocFileId { get; set; }

    public DateTime? FileCreatedDate { get; set; }
}