using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class ConferenceBridge : BaseEntity
{
    public int ConferenceBridgeId { get; set; }

    public byte? BridgeType { get; set; }

    public byte? BridgeStatus { get; set; }

    [StringLength(20)]
    [Required]
    public string DialInNumber1 { get; set; }

    [StringLength(255)]
    [Required]
    public string DialInDescription1 { get; set; }

    [StringLength(20)]
    public string DialInNumber2 { get; set; }

    [StringLength(255)]
    public string DialInDescription2 { get; set; }

    [StringLength(20)]
    public string DialInNumber3 { get; set; }

    [StringLength(255)]
    public string DialInDescription3 { get; set; }

    public DateTime? PreferredStartTime { get; set; }

    public DateTime? PreferredEndTime { get; set; }

    public SystemUser SystemUser { get; set; }

    public int? PreferredOwner { get; set; }

    [StringLength(20)]
    public string ParticipantCode { get; set; }

    [StringLength(20)]
    public string ModeratorCode { get; set; }

    [StringLength(500)]
    public string SpecialInstructions { get; set; }

    public bool? IsDeleted { get; set; }

    [StringLength(15)]
    public string WebPortalLogin { get; set; }

    [StringLength(20)]
    public string RecordCode { get; set; }

    public ICollection<Notice> Notices { get; set; }

    public ICollection<DisputeHearing> DisputeHearings { get; set; }

    public ICollection<HearingAuditLog> HearingAuditLogs { get; set; }
}