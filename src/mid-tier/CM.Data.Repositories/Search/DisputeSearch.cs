using System;

namespace CM.Data.Repositories.Search;

public class DisputeSearch
{
    public Guid DisputeGuid { get; set; }

    public byte Status { get; set; }

    public byte? Stage { get; set; }

    public byte? Process { get; set; }

    public int? Owner { get; set; }

    public DateTime StatusStartDate { get; set; }

    public DateTime SubmittedDate { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime ModifiedDate { get; set; }

    public DateTime? DisputeLastModifiedDate { get; set; }
}