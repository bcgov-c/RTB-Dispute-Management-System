namespace CM.Data.Model.Search;

public class DisputeStatusSearchResultRequest : SearchResultRequest
{
    public byte? Status { get; set; }

    public byte? Stage { get; set; }

    public string Owner { get; set; }

    public bool? IncludeHistory { get; set; }
}