using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class DisputeFlag : BaseEntity
{
    public int DisputeFlagId { get; set; }

    public Dispute Dispute { get; set; }

    [Required]
    public Guid DisputeGuid { get; set; }

    [StringLength(50)]
    public string FlagTitle { get; set; }

    public byte FlagStatus { get; set; }

    public byte FlagType { get; set; }

    public byte? FlagSubType { get; set; }

    public bool? IsPublic { get; set; }

    public int? RelatedObjectId { get; set; }

    public int? FlagParticipantId { get; set; }

    public Participant FlagParticipant { get; set; }

    public int? FlagOwnerId { get; set; }

    public SystemUser FlagOwner { get; set; }

    public DateTime? FlagStartDate { get; set; }

    public DateTime? FlagEndDate { get; set; }

    public bool? IsDeleted { get; set; }
}