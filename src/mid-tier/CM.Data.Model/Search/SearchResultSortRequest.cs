using CM.Common.Utilities;

namespace CM.Data.Model.Search;

public class SearchResultSortRequest
{
    public int? SortByField { get; set; }

    public SortDir SortDirection { get; set; }
}