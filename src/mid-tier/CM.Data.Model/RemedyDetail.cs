using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class RemedyDetail : BaseEntity
{
    public int RemedyDetailId { get; set; }

    public int RemedyId { get; set; }

    public Remedy Remedy { get; set; }

    public int DescriptionBy { get; set; }

    public Participant Participant { get; set; }

    [StringLength(1000)]
    public string Description { get; set; }

    public decimal? Amount { get; set; }

    public bool? IsDeleted { get; set; }

    public bool? IsAmended { get; set; }

    public DateTime? AssociatedDate { get; set; }

    public byte? PositionStatus { get; set; }
}