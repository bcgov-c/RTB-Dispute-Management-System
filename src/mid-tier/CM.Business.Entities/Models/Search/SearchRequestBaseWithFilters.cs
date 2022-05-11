using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Search;

public class SearchRequestBaseWithFilters : SearchRequestBase
{
    [JsonProperty("sort_by_field")]
    public int? SortByField { get; set; }

    [JsonProperty("sort_direction")]
    public SortDir SortDirection { get; set; }
}