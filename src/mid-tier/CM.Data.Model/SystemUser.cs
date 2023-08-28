using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class SystemUser : BaseEntity
{
    [Key]
    public int SystemUserId { get; set; }

    [Required]
    public Guid UserGuid { get; set; }

    public bool SchedulerManager { get; set; }

    public bool? IsActive { get; set; }

    [Required]
    public bool AdminAccess { get; set; }

    [StringLength(50)]
    [Required]
    public string Username { get; set; }

    [StringLength(250)]
    public string Password { get; set; }

    [StringLength(100)]
    public string FullName { get; set; }

    [StringLength(100)]
    public string AccountEmail { get; set; }

    [StringLength(15)]
    public string AccountMobile { get; set; }

    public bool? AcceptsTextMessages { get; set; }

    public SystemUserRole SystemUserRole { get; set; }

    public int SystemUserRoleId { get; set; }

    public bool Scheduler { get; set; }

    public ServiceOffice ServiceOffice { get; set; }

    public int? ServiceOfficeId { get; set; }

    public bool DashboardAccess { get; set; }

    public virtual ICollection<Dispute> Disputes { get; set; }

    public virtual ICollection<DisputeUser> DisputeUsers { get; set; }

    public virtual ICollection<Participant> Participants { get; set; }

    public virtual ICollection<InternalUserRole> InternalUserRoles { get; set; }

    public virtual ICollection<Task> Tasks { get; set; }

    public virtual ICollection<Task> LastOwnerTasks { get; set; }

    public virtual ICollection<AuditLog> AuditLogs { get; set; }

    public virtual ICollection<InternalUserProfile> InternalUserProfiles { get; set; }

    public virtual ICollection<AutoText> AutoTexts { get; set; }

    public virtual ICollection<ConferenceBridge> ConferenceBridges { get; set; }

    public virtual ICollection<Hearing> Hearings { get; set; }

    public virtual ICollection<Hearing> Hearings1 { get; set; }

    public virtual ICollection<Hearing> Hearings2 { get; set; }

    public virtual ICollection<Hearing> Hearings3 { get; set; }

    public virtual ICollection<Hearing> Hearings4 { get; set; }

    public virtual ICollection<Hearing> Hearings5 { get; set; }

    public virtual ICollection<HearingAuditLog> HearingAuditLogs { get; set; }

    public virtual ICollection<ScheduleBlock> ScheduleBlocks { get; set; }

    public virtual ICollection<ScheduleRequest> ScheduleRequests { get; set; }

    public virtual ICollection<ScheduleRequest> OwnerScheduleRequests { get; set; }

    public virtual ICollection<ExternalCustomDataObject> ExternalCustomDataObjects { get; set; }

    public virtual ICollection<DisputeFlag> DisputeFlags { get; set; }

    public virtual ICollection<SubstitutedService> SubstitutedServices { get; set; }

    public virtual ICollection<InternalUserRole> ManagedByInternalUserRoles { get; set; }

    public virtual ICollection<Remedy> Remedies { get; set; }

    public virtual ICollection<NoticeService> NoticeServices { get; set; }

    public virtual ICollection<HearingParticipation> HearingParticipations { get; set; }

    public virtual ICollection<HearingParticipation> PreHearingParticipations { get; set; }

    public virtual ICollection<FilePackageService> FilePackageServices { get; set; }

    public virtual ICollection<TrialDispute> TrialDisputes { get; set; }

    public virtual ICollection<TrialParticipant> TrialParticipants { get; set; }

    public virtual ICollection<ScheduleRequest> SubmitterScheduleRequests { get; set; }

    public virtual ICollection<ExternalErrorLog> ExternalErrorLogs { get; set; }

    public virtual ICollection<ParticipantIdentity> ParticipantIdentities { get; set; }

    public virtual ICollection<DisputeVerification> DisputeVerifications { get; set; }
}