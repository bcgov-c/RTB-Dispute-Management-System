using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class TrialParticipant : BaseEntity
{
    [Key]
    public Guid TrialParticipantGuid { get; set; }

    public Guid TrialGuid { get; set; }

    public Trial Trial { get; set; }

    public byte ParticipantType { get; set; }

    public Guid? DisputeGuid { get; set; }

    public Dispute Dispute { get; set; }

    public int? ParticipantId { get; set; }

    public int? SystemUserId { get; set; }

    public byte ParticipantRole { get; set; }

    public byte ParticipantStatus { get; set; }

    public byte? ParticipantSelectionMethod { get; set; }

    public bool? ParticipantOptedIn { get; set; }

    [StringLength(70)]
    public string OtherParticipantTitle { get; set; }

    [StringLength(255)]
    public string OtherParticipantDescription { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public bool? IsDeleted { get; set; }
}