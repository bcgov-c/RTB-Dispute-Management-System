using System;

namespace CM.Data.Model.Search;

public class DisputeInfoSearchResultRequest : SearchResultRequest
{
    public byte? DisputeType { get; set; }

    public byte? DisputeSubType { get; set; }

    public string TenancyAddress { get; set; }

    public string TenancyZipPostal { get; set; }

    public byte? TenancyEnded { get; set; }

    public byte? CreationMethod { get; set; }

    public DateTime? SubmittedDate { get; set; }

    public DateTime? CreatedDate { get; set; }

    public DateTime? ModifiedDate { get; set; }
}