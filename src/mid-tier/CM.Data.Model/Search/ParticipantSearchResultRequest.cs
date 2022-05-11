namespace CM.Data.Model.Search;

public class ParticipantSearchResultRequest : SearchResultRequest
{
    public string BusinessName { get; set; }

    public string AllFirstName { get; set; }

    public string AllLastName { get; set; }

    public string AllPhone { get; set; }

    public string Email { get; set; }
}