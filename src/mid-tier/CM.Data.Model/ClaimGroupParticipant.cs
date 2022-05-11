using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class ClaimGroupParticipant : BaseEntity
{
    public int ClaimGroupParticipantId { get; set; }

    public Guid DisputeGuid { get; set; }

    public Dispute Dispute { get; set; }

    public int ClaimGroupId { get; set; }

    public ClaimGroup ClaimGroup { get; set; }

    public int ParticipantId { get; set; }

    public Participant Participant { get; set; }

    [Required]
    public byte GroupParticipantRole { get; set; }

    public int? GroupPrimaryContactId { get; set; }

    public bool? IsDeleted { get; set; }
}