namespace CM.Data.Model.Search;

public class CrossApplicationSearchResultRequest : SearchResultRequest
{
    public int? ExcludeDisputeFileNumber { get; set; }

    public int? HearingAfterDays { get; set; }

    public byte? DisputeSubType { get; set; }

    public string TenancyAddress { get; set; }

    public string TenancyCity { get; set; }

    public string TenancyZipPostal { get; set; }
}

public class CrossApplicationParticipantSearchResultRequest
{
    public byte? ParticipantType { get; set; }

    public string BusinessName { get; set; }

    public string BusinessContactFirstName { get; set; }

    public string BusinessContactLastName { get; set; }

    public string FirstName { get; set; }

    public string LastName { get; set; }

    public string Email { get; set; }

    public string PrimaryPhone { get; set; }

    public string Address { get; set; }

    public string City { get; set; }

    public string PostalZip { get; set; }
}