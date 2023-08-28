using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class HearingParticipation : BaseEntity
{
    [Key]
    public int HearingParticipationId { get; set; }

    public Hearing Hearing { get; set; }

    public int HearingId { get; set; }

    public bool? IsDeleted { get; set; }

    public Participant Participant { get; set; }

    public int? ParticipantId { get; set; }

    public Dispute Dispute { get; set; }

    public Guid DisputeGuid { get; set; }

    [StringLength(255)]
    public string OtherParticipantName { get; set; }

    [StringLength(255)]
    public string OtherParticipantTitle { get; set; }

    public byte? OtherParticipantAssociation { get; set; }

    [StringLength(10)]
    public string NameAbbreviation { get; set; }

    public byte? ParticipationStatus { get; set; }

    [StringLength(500)]
    public string ParticipationComment { get; set; }

    public byte? PreParticipationStatus { get; set; }

    [StringLength(1000)]
    public string PreParticipationComment { get; set; }

    public int? ParticipationStatusBy { get; set; }

    public SystemUser ParticipationStatusUser { get; set; }

    public int? PreParticipationStatusBy { get; set; }

    public SystemUser PreParticipationStatusUser { get; set; }

    public DateTime? PreParticipationStatusDate { get; set; }
}