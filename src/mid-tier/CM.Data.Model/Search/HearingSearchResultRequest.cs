using System;

namespace CM.Data.Model.Search;

public class HearingSearchResultRequest : SearchResultRequest
{
    public DateTime? HearingStart { get; set; }

    public byte? HearingType { get; set; }

    public int? HearingOwner { get; set; }

    public byte? HearingStatus { get; set; }
}