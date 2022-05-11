using CM.Common.Utilities;
using CM.Data.Model.HearingReport;
using CM.Data.Model.Search;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Model.Context;

public static class ModelBuilderExtension
{
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
        modelBuilder.Entity<Dispute>().Property(r => r.TenancyAddressValidated).HasDefaultValue((byte)0);

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

    public static void ApplyDisputeRelations(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<DisputeStatus>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.DisputeStatuses)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid);

        modelBuilder.Entity<DisputeLastModified>()
            .HasOne(d => d.Dispute)
            .WithOne(dlm => dlm.DisputeLastModified)
            .HasForeignKey<DisputeLastModified>(d => d.DisputeGuid)
            .HasPrincipalKey<Dispute>(d => d.DisputeGuid);

        modelBuilder.Entity<DisputeProcessDetail>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.DisputeProcessDetails)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid);

        modelBuilder.Entity<DisputeUser>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.DisputeUsers)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid);

        modelBuilder.Entity<IntakeQuestion>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.IntakeQuestions)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid);

        modelBuilder.Entity<ClaimGroup>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.ClaimGroups)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Participant>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.Participants)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid);

        modelBuilder.Entity<ClaimGroupParticipant>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.ClaimGroupParticipants)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DisputeFee>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.DisputeFees)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid);

        modelBuilder.Entity<EmailMessage>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.EmailMessages)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid);

        modelBuilder.Entity<File>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.Files)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid);

        modelBuilder.Entity<FileDescription>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.FileDescriptions)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LinkedFile>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.LinkedFiles)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Notice>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.Notices)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Note>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.Notes)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Amendment>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.Amendments)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Task>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.Tasks)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OutcomeDocGroup>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.OutcomeDocGroups)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OutcomeDocFile>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.OutcomeDocFiles)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OutcomeDocDelivery>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.OutcomeDocDocDeliveries)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DisputeHearing>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.DisputeHearings)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DisputeProcessDetail>()
            .HasOne(ds => ds.DisputeStatus)
            .WithMany(d => d.DisputeProcessDetails)
            .HasForeignKey(ds => ds.StartDisputeStatusId)
            .HasPrincipalKey(d => d.DisputeStatusId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<HearingParticipation>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.HearingParticipations)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<BulkEmailRecipient>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.BulkEmailRecipients)
            .HasForeignKey(ds => ds.AssociatedDisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<HearingAuditLog>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.HearingAuditLogs)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<CustomDataObject>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.CustomDataObjects)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OutcomeDocRequest>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.OutcomeDocRequests)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid);

        modelBuilder.Entity<DisputeFlag>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.DisputeFlags)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid);

        modelBuilder.Entity<SubmissionReceipt>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.SubmissionReceipts)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid);

        modelBuilder.Entity<TrialDispute>()
            .HasOne(ds => ds.Dispute)
            .WithMany(d => d.TrialDisputes)
            .HasForeignKey(ds => ds.DisputeGuid)
            .HasPrincipalKey(d => d.DisputeGuid);
    }

    public static void ApplyParticipantRelations(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ClaimGroupParticipant>().HasOne(ds => ds.Participant).WithMany(d => d.ClaimGroupParticipants).HasForeignKey(ds => ds.ParticipantId).HasPrincipalKey(d => d.ParticipantId);

        modelBuilder.Entity<ClaimDetail>().HasOne(ds => ds.Participant).WithMany(d => d.ClaimDetails).HasForeignKey(ds => ds.DescriptionBy).HasPrincipalKey(d => d.ParticipantId);

        modelBuilder.Entity<RemedyDetail>().HasOne(ds => ds.Participant).WithMany(d => d.RemedyDetails).HasForeignKey(ds => ds.DescriptionBy).HasPrincipalKey(d => d.ParticipantId);

        modelBuilder.Entity<FileDescription>().HasOne(ds => ds.Participant).WithMany(d => d.FileDescriptions).HasForeignKey(ds => ds.DescriptionBy).HasPrincipalKey(d => d.ParticipantId);

        modelBuilder.Entity<PaymentTransaction>().HasOne(ds => ds.Participant).WithMany(d => d.PaymentTransactions).HasForeignKey(ds => ds.TransactionBy).HasPrincipalKey(d => d.ParticipantId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Notice>().HasOne(ds => ds.Participant).WithMany(d => d.Notices).HasForeignKey(ds => ds.NoticeDeliveredTo).HasPrincipalKey(d => d.ParticipantId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<NoticeService>().HasOne(ds => ds.Participant).WithMany(d => d.NoticeServices).HasForeignKey(ds => ds.ParticipantId).HasPrincipalKey(d => d.ParticipantId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Amendment>().HasOne(ds => ds.Participant).WithMany(d => d.Amendments).HasForeignKey(ds => ds.AmendmentSubmitterId).HasPrincipalKey(d => d.ParticipantId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AuditLog>().HasOne(ds => ds.SubmitterParticipant).WithMany(d => d.AuditLogs).HasForeignKey(ds => ds.SubmitterParticipantId).HasPrincipalKey(d => d.ParticipantId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<FilePackageService>().HasOne(ds => ds.Participant).WithMany(d => d.FilePackageServices).HasForeignKey(ds => ds.ParticipantId).HasPrincipalKey(d => d.ParticipantId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<FilePackageService>().HasOne(ds => ds.ServedParticipant).WithMany(d => d.ServedFilePackageServices).HasForeignKey(ds => ds.ServedBy).HasPrincipalKey(d => d.ParticipantId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DisputeProcessDetail>().HasOne(ds => ds.Participant1).WithMany(d => d.DisputeProcessDetail1).HasForeignKey(ds => ds.ProcessApplicant1Id).HasPrincipalKey(d => d.ParticipantId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DisputeProcessDetail>().HasOne(ds => ds.Participant2).WithMany(d => d.DisputeProcessDetail2).HasForeignKey(ds => ds.ProcessApplicant2Id).HasPrincipalKey(d => d.ParticipantId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OutcomeDocRequest>().HasOne(ds => ds.Submitter).WithMany(d => d.OutcomeDocRequests).HasForeignKey(ds => ds.SubmitterId).HasPrincipalKey(d => d.ParticipantId).OnDelete(DeleteBehavior.Restrict);
    }

    public static void ApplyFileRelations(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Notice>().HasOne(ds => ds.File1).WithMany(d => d.Notices1).HasForeignKey(ds => ds.NoticeFile1Id).HasPrincipalKey(d => d.FileId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Notice>().HasOne(ds => ds.File2).WithMany(d => d.Notices2).HasForeignKey(ds => ds.NoticeFile2Id).HasPrincipalKey(d => d.FileId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Notice>().HasOne(ds => ds.File3).WithMany(d => d.Notices3).HasForeignKey(ds => ds.NoticeFile3Id).HasPrincipalKey(d => d.FileId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Notice>().HasOne(ds => ds.File4).WithMany(d => d.Notices4).HasForeignKey(ds => ds.NoticeFile4Id).HasPrincipalKey(d => d.FileId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Notice>().HasOne(ds => ds.File5).WithMany(d => d.Notices5).HasForeignKey(ds => ds.NoticeFile5Id).HasPrincipalKey(d => d.FileId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<NoticeService>().HasOne(ds => ds.File1).WithMany(d => d.NoticeServices1).HasForeignKey(ds => ds.NoticeServiceFile1Id).HasPrincipalKey(d => d.FileId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<NoticeService>().HasOne(ds => ds.File2).WithMany(d => d.NoticeServices2).HasForeignKey(ds => ds.NoticeServiceFile2Id).HasPrincipalKey(d => d.FileId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<NoticeService>().HasOne(ds => ds.File3).WithMany(d => d.NoticeServices3).HasForeignKey(ds => ds.NoticeServiceFile3Id).HasPrincipalKey(d => d.FileId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<NoticeService>().HasOne(ds => ds.File4).WithMany(d => d.NoticeServices4).HasForeignKey(ds => ds.NoticeServiceFile4Id).HasPrincipalKey(d => d.FileId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<NoticeService>().HasOne(ds => ds.File5).WithMany(d => d.NoticeServices5).HasForeignKey(ds => ds.NoticeServiceFile5Id).HasPrincipalKey(d => d.FileId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<HearingImport>().HasOne(ds => ds.ImportFile).WithMany(d => d.HearingImports).HasForeignKey(ds => ds.ImportFileId).HasPrincipalKey(d => d.CommonFileId).OnDelete(DeleteBehavior.Restrict);
    }

    public static void ApplySystemUserRelations(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Dispute>().HasOne(ds => ds.SystemUser).WithMany(d => d.Disputes).HasForeignKey(ds => ds.OwnerSystemUserId).HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<InternalUserRole>().HasOne(ds => ds.SystemUser).WithMany(d => d.InternalUserRoles).HasForeignKey(ds => ds.UserId).HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Task>().HasOne(ds => ds.SystemUser).WithMany(d => d.Tasks).HasForeignKey(ds => ds.TaskOwnerId).HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Task>().HasOne(ds => ds.LastOwner).WithMany(d => d.LastOwnerTasks).HasForeignKey(ds => ds.LastOwnerId).HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AuditLog>().HasOne(ds => ds.SystemUser).WithMany(d => d.AuditLogs).HasForeignKey(ds => ds.SubmitterUserId).HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<InternalUserProfile>().HasOne(ds => ds.SystemUser).WithMany(d => d.InternalUserProfiles).HasForeignKey(ds => ds.InternalUserId).HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AutoText>().HasOne(ds => ds.SystemUser).WithMany(d => d.AutoTexts).HasForeignKey(ds => ds.TextOwner).HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ConferenceBridge>().HasOne(ds => ds.SystemUser).WithMany(d => d.ConferenceBridges).HasForeignKey(ds => ds.PreferredOwner).HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Hearing>().HasOne(ds => ds.SystemUser1).WithMany(d => d.Hearings1).HasForeignKey(ds => ds.StaffParticipant1).HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Hearing>().HasOne(ds => ds.SystemUser2).WithMany(d => d.Hearings2).HasForeignKey(ds => ds.StaffParticipant2).HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Hearing>().HasOne(ds => ds.SystemUser3).WithMany(d => d.Hearings3).HasForeignKey(ds => ds.StaffParticipant3).HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Hearing>().HasOne(ds => ds.SystemUser4).WithMany(d => d.Hearings4).HasForeignKey(ds => ds.StaffParticipant4).HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Hearing>().HasOne(ds => ds.SystemUser5).WithMany(d => d.Hearings5).HasForeignKey(ds => ds.StaffParticipant5).HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Hearing>().HasOne(ds => ds.SystemUser).WithMany(d => d.Hearings).HasForeignKey(ds => ds.HearingOwner).HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<HearingAuditLog>().HasOne(ds => ds.SystemUser).WithMany(d => d.HearingAuditLogs).HasForeignKey(ds => ds.HearingOwner).HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ScheduleBlock>().HasOne(ds => ds.SystemUser).WithMany(d => d.ScheduleBlocks).HasForeignKey(ds => ds.SystemUserId).HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ScheduleRequest>().HasOne(ds => ds.RequestorSystemUser).WithMany(d => d.ScheduleRequests).HasForeignKey(ds => ds.RequestorSystemUserId).HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ExternalCustomDataObject>().HasOne(ds => ds.OwnerSystemUser).WithMany(d => d.ExternalCustomDataObjects).HasForeignKey(ds => ds.OwnerId).HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);
    }

    public static void ApplyCommonFileRelations(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<InternalUserProfile>().HasOne(ds => ds.CommonFileProfilePic).WithMany(d => d.InternalUserProfilesProfilePic).HasForeignKey(ds => ds.ProfilePictureId).HasPrincipalKey(d => d.CommonFileId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<InternalUserProfile>().HasOne(ds => ds.CommonFileSignature).WithMany(d => d.InternalUserProfilesSignature).HasForeignKey(ds => ds.SignatureFileId).HasPrincipalKey(d => d.CommonFileId).OnDelete(DeleteBehavior.Restrict);
    }

    public static void ApplyExternalCustomDataObjectRelations(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ExternalFile>().HasOne(ds => ds.ExternalCustomDataObject).WithMany(d => d.ExternalFiles).HasForeignKey(ds => ds.ExternalCustomDataObjectId).HasPrincipalKey(d => d.ExternalCustomDataObjectId).OnDelete(DeleteBehavior.Restrict);
    }

    public static void ApplyTrialRelations(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TrialDispute>()
            .HasOne(ds => ds.Trial)
            .WithMany(d => d.TrialDisputes)
            .HasForeignKey(ds => ds.TrialGuid)
            .HasPrincipalKey(d => d.TrialGuid);

        modelBuilder.Entity<TrialParticipant>()
            .HasOne(ds => ds.Trial)
            .WithMany(d => d.TrialParticipants)
            .HasForeignKey(ds => ds.TrialGuid)
            .HasPrincipalKey(d => d.TrialGuid);

        modelBuilder.Entity<TrialIntervention>()
            .HasOne(ds => ds.Trial)
            .WithMany(d => d.TrialInterventions)
            .HasForeignKey(ds => ds.TrialGuid)
            .HasPrincipalKey(d => d.TrialGuid);

        modelBuilder.Entity<TrialOutcome>()
            .HasOne(ds => ds.Trial)
            .WithMany(d => d.TrialOutcomes)
            .HasForeignKey(ds => ds.TrialGuid)
            .HasPrincipalKey(d => d.TrialGuid);
    }

    public static void ApplySchedulePeriodRelations(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ScheduleBlock>()
            .HasOne(ds => ds.SchedulePeriod)
            .WithMany(d => d.ScheduleBlocks)
            .HasForeignKey(ds => ds.SchedulePeriodId)
            .HasPrincipalKey(d => d.SchedulePeriodId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    public static void ApplyHearingAuditLogRelations(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<HearingAuditLog>()
            .HasOne(ds => ds.Hearing)
            .WithMany(d => d.HearingAuditLogs)
            .HasForeignKey(ds => ds.HearingId)
            .HasPrincipalKey(d => d.HearingId);

        modelBuilder.Entity<HearingAuditLog>()
            .HasOne(ds => ds.ConferenceBridge)
            .WithMany(d => d.HearingAuditLogs)
            .HasForeignKey(ds => ds.ConferenceBridgeId)
            .HasPrincipalKey(d => d.ConferenceBridgeId);
    }

    public static void ApplyHearingRelations(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<DisputeHearing>()
            .HasOne(ds => ds.Hearing)
            .WithMany(d => d.DisputeHearings)
            .HasForeignKey(ds => ds.HearingId)
            .HasPrincipalKey(d => d.HearingId)
            .OnDelete(DeleteBehavior.Restrict);
    }

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

        modelBuilder.Entity<DisputeStatus>().HasIndex(s => s.DisputeGuid);
        modelBuilder.Entity<DisputeStatus>().HasIndex(s => s.Status);
        modelBuilder.Entity<DisputeStatus>().HasIndex(s => s.Stage);
        modelBuilder.Entity<DisputeStatus>().HasIndex(s => s.Process);
        modelBuilder.Entity<DisputeStatus>().HasIndex(s => s.Owner);

        modelBuilder.Entity<Participant>().HasIndex(s => s.AccessCode);

        modelBuilder.Entity<Note>().HasIndex(s => s.NoteLinkedTo);
        modelBuilder.Entity<FilePackage>().HasIndex(s => s.DisputeGuid);
        modelBuilder.Entity<DisputeHearing>().HasIndex(s => s.DisputeHearingStatus);
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
    }
}