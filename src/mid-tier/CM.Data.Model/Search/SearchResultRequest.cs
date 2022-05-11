using System;
using CM.Common.Utilities;

namespace CM.Data.Model.Search;

public class SearchResultRequest
{
    public DateTime? SubmittedDateGreaterThan { get; set; }

    public DateTime? SubmittedDateLessThan { get; set; }

    public DateTime? CreatedDateGreaterThan { get; set; }

    public DateTime? CreatedDateLessThan { get; set; }

    public DateTime? ModifiedDateGreaterThan { get; set; }

    public DateTime? ModifiedDateLessThan { get; set; }

    public bool? IncludeNotActive { get; set; }

    public int? SortByField { get; set; }

    public SortDir SortDirection { get; set; }
}