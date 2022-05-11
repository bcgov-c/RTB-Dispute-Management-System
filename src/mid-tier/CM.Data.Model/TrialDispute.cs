using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class TrialDispute : BaseEntity
{
    [Key]
    public Guid TrialDisputeGuid { get; set; }

    public Guid TrialGuid { get; set; }

    public Trial Trial { get; set; }

    public Guid DisputeGuid { get; set; }

    public Dispute Dispute { get; set; }

    public byte DisputeRole { get; set; }

    public byte? DisputeType { get; set; }

    public byte DisputeTrialStatus { get; set; }

    public byte? DisputeSelectionMethod { get; set; }

    public bool? DisputeOptedIn { get; set; }

    public int? DisputeOptedInByParticipantId { get; set; }

    public int? DisputeOptedInByStaffId { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public bool? IsDeleted { get; set; }
}