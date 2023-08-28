using CM.Common.Utilities;
using CM.Data.Model.HearingReport;
using CM.Data.Model.Search;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Model.Context;

public static class ModelBuilderExtension
{
    #region Default Values, IsDeleted Filter, Custom Sets
    public static void AddViewsAndCustomSets(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ArbitrationScheduleHearing>().HasNoKey().ToView("ArbitrationScheduleHearing");
        modelBuilder.Entity<ArbitrationScheduleIssue>().HasNoKey().ToView("ArbitrationScheduleIssue");
        modelBuilder.Entity<CrossApplicationParticipant>().ToView("CrossAppDestinationParticipants");
    }

    public static void AddDefaultValues(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Note>().Property(r => r.NoteStatus).HasDefaultValue(1);
        modelBuilder.Entity<Note>().Property(r => r.NoteLinkedTo).HasDefaultValue(0);
        modelBuilder.Entity<Amendment>().Property(r => r.AmendmentStatus).HasDefaultValue(0);

        modelBuilder.Entity<Task>().Property(r => r.TaskLinkedTo).HasDefaultValue(0);
        modelBuilder.Entity<Task>().Property(r => r.AssignedDurationSeconds).HasDefaultValue(0);
        modelBuilder.Entity<Task>().Property(r => r.UnassignedDurationSeconds).HasDefaultValue(0);

        modelBuilder.Entity<EmailMessage>().Property(r => r.AssignedTemplateId).HasDefaultValue(AssignedTemplate.CustomEmailTemplateId);
        modelBuilder.Entity<EmailMessage>().Property(r => r.BodyType).HasDefaultValue(1);
        modelBuilder.Entity<EmailMessage>().Property(r => r.Retries).HasDefaultValue(0);
        modelBuilder.Entity<EmailMessage>().Property(r => r.SendMethod).HasDefaultValue(1);

        modelBuilder.Entity<File>().Property(r => r.FileType).HasDefaultValue(0);
        modelBuilder.Entity<File>().Property(r => r.FileStatus).HasDefaultValue(FileStatus.NotReviewed);
        modelBuilder.Entity<File>().Property(r => r.FileConsidered).HasDefaultValue(true);
        modelBuilder.Entity<File>().Property(r => r.FileReferenced).HasDefaultValue(false);
        modelBuilder.Entity<File>().Property(r => r.IsDeficient).HasDefaultValue(false);
        modelBuilder.Entity<File>().Property(r => r.PublicAccessAllowed).HasDefaultValue(false);
        modelBuilder.Entity<File>().Property(r => r.Storage).HasDefaultValue(StorageType.File);
        modelBuilder.Entity<File>().Property(r => r.IsSourceFileDeleted).HasDefaultValue(false);

        modelBuilder.Entity<FileDescription>().Property(r => r.IsDeficient).HasDefaultValue(false);

        modelBuilder.Entity<InternalUserRole>().Property(r => r.IsActive).HasDefaultValue(true);
        modelBuilder.Entity<InternalUserRole>().Property(r => r.EngagementType).HasDefaultValue(EngagementType.FtEmployee);

        modelBuilder.Entity<Notice>().Property(r => r.NoticeVersion).HasDefaultValue((byte)0);

        modelBuilder.Entity<Participant>().Property(r => r.ParticipantStatus).HasDefaultValue((byte)1);
        modelBuilder.Entity<Participant>().Property(r => r.EmailVerified).HasDefaultValue(false);
        modelBuilder.Entity<Participant>().Property(r => r.NoEmail).HasDefaultValue(true);
        modelBuilder.Entity<Participant>().Property(r => r.PrimaryPhoneVerified).HasDefaultValue(false);
        modelBuilder.Entity<Participant>().Property(r => r.SecondaryPhoneVerified).HasDefaultValue(false);
        modelBuilder.Entity<Participant>().Property(r => r.IsSubService).HasDefaultValue(false);
        modelBuilder.Entity<Participant>().Property(r => r.AddressIsValidated).HasDefaultValue(false);
        modelBuilder.Entity<Participant>().Property(r => r.MailAddressIsValidated).HasDefaultValue(false);

        modelBuilder.Entity<PaymentTransaction>().Property(r => r.ReconcileStatus).HasDefaultValue((byte)0);

        modelBuilder.Entity<SystemUserRole>().Property(r => r.SessionDuration).HasDefaultValue(900);
        modelBuilder.Entity<SystemUser>().Property(r => r.Scheduler).HasDefaultValue(false);
        modelBuilder.Entity<SystemUser>().Property(r => r.SchedulerManager).HasDefaultValue(false);
        modelBuilder.Entity<SystemUser>().Property(r => r.DashboardAccess).HasDefaultValue(false);

        modelBuilder.Entity<OutcomeDocGroup>().Property(r => r.DocStatus).HasDefaultValue((byte)1);
        modelBuilder.Entity<OutcomeDocGroup>().Property(r => r.IsDeleted).HasDefaultValue(false);
        modelBuilder.Entity<OutcomeDocFile>().Property(r => r.VisibleToPublic).HasDefaultValue(false);
        modelBuilder.Entity<OutcomeDocFile>().Property(r => r.NoteWorthy).HasDefaultValue(false);
        modelBuilder.Entity<OutcomeDocFile>().Property(r => r.MateriallyDifferent).HasDefaultValue(false);
        modelBuilder.Entity<OutcomeDocFile>().Property(r => r.IsDeleted).HasDefaultValue(false);
        modelBuilder.Entity<OutcomeDocContent>().Property(r => r.IsDeleted).HasDefaultValue(false);
        modelBuilder.Entity<OutcomeDocDelivery>().Property(r => r.IsDeleted).HasDefaultValue(false);
        modelBuilder.Entity<OutcomeDocDelivery>().Property(r => r.ReadyForDelivery).HasDefaultValue(false);
        modelBuilder.Entity<AutoText>().Property(r => r.IsDeleted).HasDefaultValue(false);
        modelBuilder.Entity<DisputeProcessDetail>().Property(r => r.IsDeleted).HasDefaultValue(false);

        modelBuilder.Entity<ConferenceBridge>().Property(r => r.BridgeStatus).HasDefaultValue((byte)1);
        modelBuilder.Entity<DisputeHearing>().Property(r => r.DisputeHearingStatus).HasDefaultValue((byte)1);

        modelBuilder.Entity<Hearing>().Property(r => r.UseCustomSchedule).HasDefaultValue(false);
        modelBuilder.Entity<Hearing>().Property(r => r.UseSpecialInstructions).HasDefaultValue(false);
        modelBuilder.Entity<ServiceOffice>().Property(r => r.IsDeleted).HasDefaultValue(false);

        modelBuilder.Entity<Dispute>().Property(r => r.FilesStorageSetting).HasDefaultValue(DisputeStorageType.Hot);
        modelBuilder.Entity<Dispute>().Property(r => r.TenancyAddressValidated).HasDefaultValue(false);

        modelBuilder.Entity<DisputeFee>().Property(r => r.IsActive).HasDefaultValue(true);
        modelBuilder.Entity<DisputeFee>().Property(r => r.IsPaid).HasDefaultValue(false);

        modelBuilder.Entity<DisputeStatus>().Property(r => r.IsActive).HasDefaultValue(false);

        modelBuilder.Entity<CustomDataObject>().Property(r => r.IsDeleted).HasDefaultValue(false);
        modelBuilder.Entity<CustomDataObject>().Property(r => r.IsAmended).HasDefaultValue(false);

        modelBuilder.Entity<ExternalCustomDataObject>().Property(r => r.IsDeleted).HasDefaultValue(false);
        modelBuilder.Entity<SchedulePeriod>().Property(r => r.IsDeleted).HasDefaultValue(false);
        modelBuilder.Entity<SchedulePeriod>().Property(r => r.PeriodStatus).HasDefaultValue(PeriodStatus.Inactive);

        modelBuilder.Entity<ScheduleRequest>().Property(r => r.IsDeleted).HasDefaultValue(false);

        modelBuilder.Entity<DisputeFlag>().Property(r => r.IsDeleted).HasDefaultValue(false);
        modelBuilder.Entity<DisputeFlag>().Property(r => r.IsPublic).HasDefaultValue(false);
        modelBuilder.Entity<DisputeFlag>().Property(r => r.FlagStatus).HasDefaultValue(true);

        modelBuilder.Entity<Notice>().Property(r => r.HasServiceDeadline).HasDefaultValue(false);

        modelBuilder.Entity<ExternalErrorLog>().Property(r => r.IsDeleted).HasDefaultValue(false);

        modelBuilder.Entity<Poll>().Property(r => r.IsDeleted).HasDefaultValue(false);

        modelBuilder.Entity<OnlineMeeting>().Property(r => r.IsDeleted).HasDefaultValue(false);
        modelBuilder.Entity<DisputeLink>().Property(r => r.IsDeleted).HasDefaultValue(false);
        modelBuilder.Entity<DisputeVerification>().Property(r => r.IsDeleted).HasDefaultValue(false);
        modelBuilder.Entity<VerificationAttempt>().Property(r => r.IsDeleted).HasDefaultValue(false);
    }

    public static void ApplyIsDeletedFilter(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Participant>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<ClaimGroup>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<ClaimGroupParticipant>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<Claim>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<ClaimDetail>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<Remedy>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<RemedyDetail>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<EmailMessage>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<EmailAttachment>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<EmailTemplate>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<Hearing>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<HearingParticipation>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<DisputeFee>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<PaymentTransaction>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<File>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<FileDescription>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<LinkedFile>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<CommonFile>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<Notice>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<NoticeService>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<Task>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<Note>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<OutcomeDocGroup>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<OutcomeDocFile>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<OutcomeDocContent>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<OutcomeDocDelivery>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<AutoText>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<ConferenceBridge>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<DisputeHearing>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<ServiceOffice>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<FilePackageService>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<DisputeProcessDetail>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<SubstitutedService>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<CustomDataObject>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<SchedulePeriod>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<ScheduleBlock>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<ScheduleRequest>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<OutcomeDocRequest>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<OutcomeDocReqItem>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<DisputeFlag>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<SubmissionReceipt>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<Trial>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<TrialDispute>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<TrialParticipant>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<TrialIntervention>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<TrialOutcome>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<CustomConfigObject>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<ExternalCustomDataObject>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<ExternalFile>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<ExternalErrorLog>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<Poll>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<PollResponse>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<ParticipantIdentity>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<OnlineMeeting>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<DisputeLink>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<DisputeVerification>().HasQueryFilter(r => r.IsDeleted == false);
        modelBuilder.Entity<VerificationAttempt>().HasQueryFilter(r => r.IsDeleted == false);
    }

    public static void ApplyColumnsCustomTypes(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Remedy>().Property(r => r.AwardedAmount).HasColumnType("decimal(10,2)");
        modelBuilder.Entity<RemedyDetail>().Property(r => r.Amount).HasColumnType("decimal(10,2)");
        modelBuilder.Entity<DisputeFee>().Property(r => r.AmountDue).HasColumnType("decimal(10,2)");
        modelBuilder.Entity<PaymentTransaction>().Property(r => r.TransactionAmount).HasColumnType("decimal(10,2)");
        modelBuilder.Entity<PaymentTransaction>().Property(r => r.FeeWaiverIncome).HasColumnType("decimal(10,2)");
        modelBuilder.Entity<PaymentTransaction>().Property(r => r.CardType).HasColumnType("char(2)");
        modelBuilder.Entity<CustomConfigObject>().Property(r => r.ObjectVersionId).HasColumnType("decimal(4,2)");
    }
    #endregion

    #region Relations
    public static void ApplyRelations(this ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyDisputeRelations();
        modelBuilder.ApplyTrialRelations();
        modelBuilder.ApplyParticipantRelations();
        modelBuilder.ApplySystemUserRelations();
        modelBuilder.ApplyFileRelations();
        modelBuilder.ApplyCommonFileRelations();
        modelBuilder.ApplySchedulePeriodRelations();
        modelBuilder.ApplyHearingRelations();
        modelBuilder.ApplySubstitutedServicesRelations();
        modelBuilder.ApplyExternalCustomDataObjectRelations();
        modelBuilder.ApplyHearingAuditLogRelations();
        modelBuilder.ApplyNoticeRelations();
        modelBuilder.ApplyServiceAuditLogsRelations();
        modelBuilder.ApplyEmailRelations();
        modelBuilder.ApplyOutcomeDocRelations();
        modelBuilder.ApplyPollRelations();
        modelBuilder.ApplyOnlineMeetingRelations();
        modelBuilder.ApplyDisputeVerificationRelations();
    }
    #endregion

    #region Indexes
    public static void ApplyIndexes(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserToken>().HasIndex(s => s.SystemUserId);
        modelBuilder.Entity<UserToken>().HasIndex(s => s.AuthToken);

        modelBuilder.Entity<Dispute>().HasIndex(s => s.DisputeGuid);
        modelBuilder.Entity<Dispute>().HasIndex(s => s.CreatedDate);
        modelBuilder.Entity<Dispute>().HasIndex(s => s.SubmittedDate);
        modelBuilder.Entity<Dispute>().HasIndex(s => s.ModifiedDate);
        modelBuilder.Entity<Dispute>().HasIndex(s => s.CreationMethod);
        modelBuilder.Entity<Dispute>().HasIndex(s => s.FileNumber);
        modelBuilder.Entity<Dispute>().HasIndex(s => s.TenancyAddress);
        modelBuilder.Entity<Dispute>().HasIndex(s => s.TenancyZipPostal);
        modelBuilder.Entity<Dispute>().HasIndex(s => s.OwnerSystemUserId);
        modelBuilder.Entity<Dispute>().HasIndex(s => s.TenancyCity);
        modelBuilder.Entity<Dispute>().HasIndex(s => s.InitialPaymentDate);

        modelBuilder.Entity<DisputeLastModified>().HasIndex(s => s.LastModifiedDate);

        modelBuilder.Entity<DisputeStatus>().HasIndex(s => s.DisputeGuid);
        modelBuilder.Entity<DisputeStatus>().HasIndex(s => s.Status);
        modelBuilder.Entity<DisputeStatus>().HasIndex(s => s.Stage);
        modelBuilder.Entity<DisputeStatus>().HasIndex(s => s.Process);
        modelBuilder.Entity<DisputeStatus>().HasIndex(s => s.Owner);
        modelBuilder.Entity<DisputeStatus>().HasIndex(s => s.DisputeStatusId);
        modelBuilder.Entity<DisputeStatus>().HasIndex(s => s.IsActive);

        modelBuilder.Entity<Participant>().HasIndex(s => s.AccessCode);
        modelBuilder.Entity<Participant>().HasIndex(s => s.DisputeGuid);
        modelBuilder.Entity<Participant>().HasIndex(s => s.ParticipantStatus);

        modelBuilder.Entity<Note>().HasIndex(s => s.NoteLinkedTo);
        modelBuilder.Entity<Note>().HasIndex(s => s.DisputeGuid);

        modelBuilder.Entity<FilePackage>().HasIndex(s => s.DisputeGuid);

        modelBuilder.Entity<DisputeHearing>().HasIndex(s => s.DisputeHearingStatus);
        modelBuilder.Entity<DisputeHearing>().HasIndex(s => s.HearingId);
        modelBuilder.Entity<DisputeHearing>().HasIndex(s => s.DisputeGuid);
        modelBuilder.Entity<DisputeHearing>().HasIndex(s => s.DisputeHearingRole);

        modelBuilder.Entity<AuditLog>()
            .HasIndex(s => s.DisputeGuid)
            .IncludeProperties(p => new { p.ApiResponse, p.ApiCallType });

        modelBuilder.Entity<Hearing>().HasIndex(s => new { s.LocalStartDateTime, s.LocalEndDateTime });

        modelBuilder.Entity<EmailMessage>()
            .HasIndex(s => new { s.SendStatus, s.MessageType, s.IsActive });

        modelBuilder.Entity<EmailMessage>().HasIndex(s => s.PreferredSendDate);
        modelBuilder.Entity<EmailMessage>().HasIndex(s => s.CreatedDate);
        modelBuilder.Entity<EmailMessage>().HasIndex(s => s.DisputeGuid);

        modelBuilder.Entity<UserToken>()
            .HasIndex(s => new { s.ExpiresOn, s.AuthToken });

        modelBuilder.Entity<TrialIntervention>().HasIndex(s => s.TrialDisputeGuid);
        modelBuilder.Entity<TrialIntervention>().HasIndex(s => s.TrialParticipantGuid);

        modelBuilder.Entity<TrialParticipant>().HasIndex(s => s.DisputeGuid);

        modelBuilder.Entity<TrialOutcome>().HasIndex(s => s.TrialDisputeGuid);

        modelBuilder.Entity<SystemSettings>().HasIndex(s => s.Key);

        modelBuilder.Entity<Task>().HasIndex(s => s.DisputeGuid);
        modelBuilder.Entity<Task>().HasIndex(s => s.TaskStatus);
        modelBuilder.Entity<Task>().HasIndex(s => s.TaskOwnerId);
        modelBuilder.Entity<Task>().HasIndex(s => s.TaskSubType);
        modelBuilder.Entity<Task>().HasIndex(s => s.TaskActivityType);
        modelBuilder.Entity<Task>().HasIndex(s => s.DateTaskCompleted);

        modelBuilder.Entity<SubstitutedService>().HasIndex(s => s.DisputeGuid);
        modelBuilder.Entity<SubstitutedService>().HasIndex(s => s.RequestSource);

        modelBuilder.Entity<CMSParticipant>().HasIndex(s => s.Request_ID);
        modelBuilder.Entity<CMSParticipant>().HasIndex(s => s.Participant_Type);
        modelBuilder.Entity<CMSParticipant>().HasIndex(s => s.CMS_Sequence_Number);

        modelBuilder.Entity<OutcomeDocDelivery>().HasIndex(s => s.DisputeGuid);
        modelBuilder.Entity<OutcomeDocDelivery>().HasIndex(s => s.DeliveryMethod);
        modelBuilder.Entity<OutcomeDocDelivery>().HasIndex(s => s.IsDelivered);
        modelBuilder.Entity<OutcomeDocDelivery>().HasIndex(s => s.DeliveryDate);
        modelBuilder.Entity<OutcomeDocDelivery>().HasIndex(s => s.ReadyForDelivery);

        modelBuilder.Entity<ScheduleBlock>().HasIndex(s => s.SchedulePeriodId);
        modelBuilder.Entity<ScheduleBlock>().HasIndex(s => s.SystemUserId);
        modelBuilder.Entity<ScheduleBlock>().HasIndex(s => s.BlockStart);
        modelBuilder.Entity<ScheduleBlock>().HasIndex(s => s.BlockEnd);
        modelBuilder.Entity<ScheduleBlock>().HasIndex(s => s.BlockType);

        modelBuilder.Entity<ConferenceBridge>().HasIndex(s => s.PreferredStartTime);
        modelBuilder.Entity<ConferenceBridge>().HasIndex(s => s.PreferredEndTime);
        modelBuilder.Entity<ConferenceBridge>().HasIndex(s => s.PreferredOwner);

        modelBuilder.Entity<DataModel>().HasIndex(s => s.Request_ID);
        modelBuilder.Entity<DataModel>().HasIndex(s => s.File_Number);

        modelBuilder.Entity<Claim>().HasIndex(s => s.ClaimGroupId);
        modelBuilder.Entity<Claim>().HasIndex(s => s.ClaimStatus);

        modelBuilder.Entity<CMSFile>().HasIndex(s => s.File_Number);
        modelBuilder.Entity<CMSFile>().HasIndex(s => s.File_Type);

        modelBuilder.Entity<SystemUserRole>().HasIndex(s => s.RoleName);

        modelBuilder.Entity<OutcomeDocFile>().HasIndex(s => s.DisputeGuid);
        modelBuilder.Entity<OutcomeDocFile>().HasIndex(s => s.OutcomeDocGroupId);
        modelBuilder.Entity<OutcomeDocFile>().HasIndex(s => s.FileType);
        modelBuilder.Entity<OutcomeDocFile>().HasIndex(s => s.FileId);

        modelBuilder.Entity<ClaimGroup>().HasIndex(s => s.DisputeGuid);

        modelBuilder.Entity<InternalUserRole>().HasIndex(s => s.RoleGroupId);
        modelBuilder.Entity<InternalUserRole>().HasIndex(s => s.EngagementType);
        modelBuilder.Entity<InternalUserRole>().HasIndex(s => s.RoleSubtypeId);

        modelBuilder.Entity<ClaimGroupParticipant>().HasIndex(s => s.DisputeGuid);
        modelBuilder.Entity<ClaimGroupParticipant>().HasIndex(s => s.ClaimGroupId);
        modelBuilder.Entity<ClaimGroupParticipant>().HasIndex(s => s.ParticipantId);
        modelBuilder.Entity<ClaimGroupParticipant>().HasIndex(s => s.GroupParticipantRole);
        modelBuilder.Entity<ClaimGroupParticipant>().HasIndex(s => s.GroupPrimaryContactId);

        modelBuilder.Entity<DisputeFee>().HasIndex(s => s.DisputeGuid);
        modelBuilder.Entity<DisputeFee>().HasIndex(s => s.IsPaid);
        modelBuilder.Entity<DisputeFee>().HasIndex(s => s.DatePaid);

        modelBuilder.Entity<CommonFile>().HasIndex(s => s.FileType);

        modelBuilder.Entity<EmailTemplate>().HasIndex(s => s.AssignedTemplateId);

        modelBuilder.Entity<Notice>().HasIndex(s => s.DisputeGuid);
        modelBuilder.Entity<Notice>().HasIndex(s => s.NoticeType);
        modelBuilder.Entity<Notice>().HasIndex(s => s.HearingId);
        modelBuilder.Entity<Notice>().HasIndex(s => s.NoticeAssociatedTo);

        modelBuilder.Entity<NoticeService>().HasIndex(s => s.NoticeId);
        modelBuilder.Entity<NoticeService>().HasIndex(s => s.IsServed);
        modelBuilder.Entity<NoticeService>().HasIndex(s => s.ProofFileDescriptionId);

        modelBuilder.Entity<Poll>().HasIndex(s => s.PollStatus);
        modelBuilder.Entity<Poll>().HasIndex(s => s.PollSite);
        modelBuilder.Entity<Poll>().HasIndex(s => s.PollType);

        modelBuilder.Entity<DisputeLink>().HasIndex(s => s.DisputeGuid);
    }

    public static void ApplyUniqueIndexes(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<DisputeStatus>().HasIndex(e => new { e.DisputeGuid, e.IsActive }).IsUnique().HasFilter(@"""IsActive"" = true");
        modelBuilder.Entity<IntakeQuestion>().HasIndex(p => new { p.DisputeGuid, p.QuestionName }).IsUnique();
        modelBuilder.Entity<InternalUserRole>().HasIndex(p => new { p.UserId, p.RoleGroupId, p.RoleSubtypeId }).IsUnique();
        modelBuilder.Entity<ConferenceBridge>().HasIndex(p => new { p.ModeratorCode }).IsUnique();
        modelBuilder.Entity<ConferenceBridge>().HasIndex(p => new { p.ParticipantCode }).IsUnique();
        modelBuilder.Entity<SystemUser>().HasIndex(p => new { p.Username, p.IsActive }).IsUnique();
        modelBuilder.Entity<SystemUser>().HasIndex(p => new { p.AccountEmail, p.IsActive }).IsUnique();
        modelBuilder.Entity<EmailTemplate>().HasIndex(e => e.AssignedTemplateId).IsUnique();
        modelBuilder.Entity<Trial>().HasIndex(e => e.TrialGuid).IsUnique();
        modelBuilder.Entity<CustomConfigObject>().HasIndex(e => e.ObjectTitle).IsUnique();
        modelBuilder.Entity<Poll>().HasIndex(e => e.PollTitle).IsUnique();
    }
    #endregion
}