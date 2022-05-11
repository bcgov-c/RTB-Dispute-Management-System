using System;

namespace CM.Data.Repositories.Search;

public class DisputeMessageOwnersSearch : DisputeSearch
{
    public int EmailMessageId { get; set; }

    public DateTime? MessageCreatedDate { get; set; }
}