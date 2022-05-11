using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class DisputeUser : BaseEntity
{
    public int DisputeUserId { get; set; }

    public Dispute Dispute { get; set; }

    [Required]
    public Guid DisputeGuid { get; set; }

    public SystemUser SystemUser { get; set; }

    public int SystemUserId { get; set; }

    [Required]
    public bool IsActive { get; set; }

    public Participant Participant { get; set; }

    public int? ParticipantId { get; set; }
}