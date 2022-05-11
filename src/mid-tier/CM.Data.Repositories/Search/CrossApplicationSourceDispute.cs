namespace CM.Data.Repositories.Search;

public class CrossApplicationSourceDispute
{
    public string TenancyCitySoundex { get; set; }

    public string TenancyZipPostal { get; set; }
}

public class CrossApplicationDestinationDispute : DisputeSearch
{
    public string TenancyCitySoundex { get; set; }

    public string TenancyZipPostal { get; set; }

    public string TenancyAddress { get; set; }
}