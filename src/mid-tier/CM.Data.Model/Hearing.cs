using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class Hearing : BaseEntity
{
    public int HearingId { get; set; }

    public byte HearingType { get; set; }

    public byte? HearingSubType { get; set; }

    public byte? HearingPriority { get; set; }

    public ConferenceBridge ConferenceBridge { get; set; }

    public int? ConferenceBridgeId { get; set; }

    public SystemUser SystemUser { get; set; }

    public int? HearingOwner { get; set; }

    public SystemUser SystemUser1 { get; set; }

    public int? StaffParticipant1 { get; set; }

    public SystemUser SystemUser2 { get; set; }

    public int? StaffParticipant2 { get; set; }

    public SystemUser SystemUser3 { get; set; }

    public int? StaffParticipant3 { get; set; }

    public SystemUser SystemUser4 { get; set; }

    public int? StaffParticipant4 { get; set; }

    public SystemUser SystemUser5 { get; set; }

    public int? StaffParticipant5 { get; set; }

    [StringLength(255)]
    public string OtherStaffParticipants { get; set; }

    public bool? IsDeleted { get; set; }

    public byte? HearingMethod { get; set; }

    public bool? UseCustomSchedule { get; set; }

    public DateTime? HearingStartDateTime { get; set; }

    public DateTime? HearingEndDateTime { get; set; }

    public DateTime? LocalStartDateTime { get; set; }

    public DateTime? LocalEndDateTime { get; set; }

    [StringLength(255)]
    public string HearingLocation { get; set; }

    public bool? UseSpecialInstructions { get; set; }

    [StringLength(1500)]
    public string SpecialInstructions { get; set; }

    [StringLength(1500)]
    public string HearingDetails { get; set; }

    public byte? HearingComplexity { get; set; }

    public int? HearingDuration { get; set; }

    [StringLength(255)]
    public string HearingNote { get; set; }

    public int? HearingPrepTime { get; set; }

    public DateTime? HearingReservedUntil { get; set; }

    public int? HearingReservedById { get; set; }

    public UserToken HearingReservedBy { get; set; }

    public int? NotificationFileDescriptionId { get; set; }

    public FileDescription NotificationFileDescription { get; set; }

    public Guid? HearingReservedDisputeGuid { get; set; }

    public Dispute HearingReservedDispute { get; set; }

    [StringLength(150)]
    public string NotificationDeliveryDescription { get; set; }

    public DateTime? NotificationDeliveryDate { get; set; }

    public byte? ConferenceType { get; set; }

    public virtual ICollection<DisputeHearing> DisputeHearings { get; set; }

    public virtual ICollection<HearingParticipation> HearingParticipations { get; set; }

    public virtual ICollection<HearingAuditLog> HearingAuditLogs { get; set; }

    public virtual ICollection<Notice> Notices { get; set; }

    public virtual ICollection<DisputeVerification> DisputeVerifications { get; set; }
}