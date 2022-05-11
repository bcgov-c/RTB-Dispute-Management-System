namespace CM.Data.Model.Search;

public class ClaimsSearchResultRequest : SearchResultRequest
{
    public int[] ClaimCodes { get; set; }
}