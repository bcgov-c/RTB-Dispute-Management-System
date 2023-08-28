using Microsoft.EntityFrameworkCore;

namespace CM.Data.Model.Context
{
    internal static class ModelRelationsConfiguration
    {
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

            modelBuilder.Entity<DisputeFee>()
                .HasOne(ds => ds.Payor)
                .WithMany(d => d.DisputeFees)
                .HasForeignKey(ds => ds.PayorId)
                .HasPrincipalKey(d => d.ParticipantId);

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

            modelBuilder.Entity<ServiceAuditLog>()
                .HasOne(sal => sal.Dispute)
                .WithMany(d => d.ServiceAuditLogs)
                .HasForeignKey(sal => sal.DisputeGuid)
                .HasPrincipalKey(d => d.DisputeGuid)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Dispute>()
                .HasOne(ds => ds.OriginalNotice)
                .WithMany(d => d.Disputes)
                .HasForeignKey(ds => ds.OriginalNoticeId)
                .HasPrincipalKey(d => d.NoticeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Dispute>()
                .HasOne(ds => ds.InitialPaymentParticipant)
                .WithMany(d => d.Disputes)
                .HasForeignKey(ds => ds.InitialPaymentBy)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Dispute>()
                .HasOne(ds => ds.SubmittedParticipant)
                .WithMany(d => d.SubPartDisputes)
                .HasForeignKey(ds => ds.SubmittedBy)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AuditLog>()
                .HasOne(ds => ds.Dispute)
                .WithMany(d => d.AuditLogs)
                .HasForeignKey(ds => ds.DisputeGuid)
                .HasPrincipalKey(d => d.DisputeGuid)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PaymentTransaction>()
                .HasOne(ds => ds.DisputeFee)
                .WithMany(d => d.PaymentTransactions)
                .HasForeignKey(ds => ds.DisputeFeeId)
                .HasPrincipalKey(d => d.DisputeFeeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ExternalErrorLog>()
                .HasOne(ds => ds.Dispute)
                .WithMany(d => d.ExternalErrorLogs)
                .HasForeignKey(ds => ds.DisputeGuid)
                .HasPrincipalKey(d => d.DisputeGuid)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PollResponse>()
                .HasOne(ds => ds.Dispute)
                .WithMany(d => d.PollResponses)
                .HasForeignKey(ds => ds.DisputeGuid)
                .HasPrincipalKey(d => d.DisputeGuid)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ParticipantIdentity>()
                .HasOne(ds => ds.Dispute)
                .WithMany(d => d.IdentityParticipants)
                .HasForeignKey(ds => ds.DisputeGuid)
                .HasPrincipalKey(d => d.DisputeGuid)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ParticipantIdentity>()
                .HasOne(ds => ds.IdentityDispute)
                .WithMany(d => d.ParticipantIdentities)
                .HasForeignKey(ds => ds.IdentityDisputeGuid)
                .HasPrincipalKey(d => d.DisputeGuid)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DisputeLink>()
                .HasOne(ds => ds.Dispute)
                .WithMany(d => d.DisputeLinks)
                .HasForeignKey(ds => ds.DisputeGuid)
                .HasPrincipalKey(d => d.DisputeGuid)
                .OnDelete(DeleteBehavior.Restrict);
        }

        public static void ApplyParticipantRelations(this ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ClaimGroupParticipant>().HasOne(ds => ds.Participant)
                .WithMany(d => d.ClaimGroupParticipants).HasForeignKey(ds => ds.ParticipantId)
                .HasPrincipalKey(d => d.ParticipantId);

            modelBuilder.Entity<ClaimDetail>().HasOne(ds => ds.Participant)
                .WithMany(d => d.ClaimDetails).HasForeignKey(ds => ds.DescriptionBy)
                .HasPrincipalKey(d => d.ParticipantId);

            modelBuilder.Entity<RemedyDetail>().HasOne(ds => ds.Participant)
                .WithMany(d => d.RemedyDetails).HasForeignKey(ds => ds.DescriptionBy)
                .HasPrincipalKey(d => d.ParticipantId);

            modelBuilder.Entity<FileDescription>().HasOne(ds => ds.Participant)
                .WithMany(d => d.FileDescriptions).HasForeignKey(ds => ds.DescriptionBy)
                .HasPrincipalKey(d => d.ParticipantId);

            modelBuilder.Entity<PaymentTransaction>().HasOne(ds => ds.Participant)
                .WithMany(d => d.PaymentTransactions).HasForeignKey(ds => ds.TransactionBy)
                .HasPrincipalKey(d => d.ParticipantId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notice>().HasOne(ds => ds.Participant)
                .WithMany(d => d.Notices).HasForeignKey(ds => ds.NoticeDeliveredTo)
                .HasPrincipalKey(d => d.ParticipantId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<NoticeService>().HasOne(ds => ds.Participant)
                .WithMany(d => d.NoticeServices).HasForeignKey(ds => ds.ParticipantId)
                .HasPrincipalKey(d => d.ParticipantId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Amendment>().HasOne(ds => ds.Participant)
                .WithMany(d => d.Amendments).HasForeignKey(ds => ds.AmendmentSubmitterId)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AuditLog>().HasOne(ds => ds.SubmitterParticipant)
                .WithMany(d => d.AuditLogs).HasForeignKey(ds => ds.SubmitterParticipantId)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FilePackageService>().HasOne(ds => ds.Participant)
                .WithMany(d => d.FilePackageServices).HasForeignKey(ds => ds.ParticipantId)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FilePackageService>().HasOne(ds => ds.ServedParticipant)
                .WithMany(d => d.ServedFilePackageServices).HasForeignKey(ds => ds.ServedBy)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DisputeProcessDetail>().HasOne(ds => ds.Participant1)
                .WithMany(d => d.DisputeProcessDetail1).HasForeignKey(ds => ds.ProcessApplicant1Id)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DisputeProcessDetail>().HasOne(ds => ds.Participant2)
                .WithMany(d => d.DisputeProcessDetail2).HasForeignKey(ds => ds.ProcessApplicant2Id)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OutcomeDocRequest>().HasOne(ds => ds.Submitter)
                .WithMany(d => d.OutcomeDocRequests).HasForeignKey(ds => ds.SubmitterId)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DisputeFlag>().HasOne(ds => ds.FlagParticipant)
                .WithMany(d => d.DisputeFlags).HasForeignKey(ds => ds.FlagParticipantId)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DisputeUser>().HasOne(ds => ds.Participant)
                .WithMany(d => d.DisputeUsers).HasForeignKey(ds => ds.ParticipantId)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ClaimGroupParticipant>().HasOne(ds => ds.GroupPrimaryContact)
                .WithMany(d => d.PrimaryContactClaimGroupParticipants).HasForeignKey(ds => ds.GroupPrimaryContactId)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ClaimGroupParticipant>().HasOne(ds => ds.ClaimGroup)
                .WithMany(d => d.ClaimGroupParticipants).HasForeignKey(ds => ds.ClaimGroupId)
                .HasPrincipalKey(d => d.ClaimGroupId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Claim>().HasOne(ds => ds.ClaimGroup)
                .WithMany(d => d.Claims).HasForeignKey(ds => ds.ClaimGroupId)
                .HasPrincipalKey(d => d.ClaimGroupId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ClaimDetail>().HasOne(ds => ds.Claim)
                .WithMany(d => d.ClaimDetails).HasForeignKey(ds => ds.ClaimId)
                .HasPrincipalKey(d => d.ClaimId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Remedy>().HasOne(ds => ds.Claim)
                .WithMany(d => d.Remedies).HasForeignKey(ds => ds.ClaimId)
                .HasPrincipalKey(d => d.ClaimId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PollResponse>().HasOne(ds => ds.Participant)
                .WithMany(d => d.PollResponses).HasForeignKey(ds => ds.ParticipantId)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ParticipantIdentity>()
                .HasOne(ds => ds.Participant)
                .WithMany(d => d.IdentityParticipants)
                .HasForeignKey(ds => ds.ParticipantId)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ParticipantIdentity>()
                .HasOne(ds => ds.IdentityParticipant)
                .WithMany(d => d.ParticipantIdentities)
                .HasForeignKey(ds => ds.IdentityParticipantId)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        public static void ApplyFileRelations(this ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<HearingImport>().HasOne(ds => ds.ImportFile)
                .WithMany(d => d.HearingImports).HasForeignKey(ds => ds.ImportFileId)
                .HasPrincipalKey(d => d.CommonFileId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Amendment>()
                .HasOne(ds => ds.AmendFileDescription)
                .WithMany(d => d.Amendments)
                .HasForeignKey(ds => ds.AmendFileDescriptionId)
                .HasPrincipalKey(d => d.FileDescriptionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FileDescription>()
                .HasOne(ds => ds.Claim)
                .WithMany(d => d.FileDescriptions)
                .HasForeignKey(ds => ds.ClaimId)
                .HasPrincipalKey(d => d.ClaimId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FileDescription>()
                .HasOne(ds => ds.Remedy)
                .WithMany(d => d.FileDescriptions)
                .HasForeignKey(ds => ds.RemedyId)
                .HasPrincipalKey(d => d.RemedyId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<LinkedFile>()
                .HasOne(ds => ds.FileDescription)
                .WithMany(d => d.LinkedFiles)
                .HasForeignKey(ds => ds.FileDescriptionId)
                .HasPrincipalKey(d => d.FileDescriptionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<LinkedFile>()
                .HasOne(ds => ds.File)
                .WithMany(d => d.LinkedFiles)
                .HasForeignKey(ds => ds.FileId)
                .HasPrincipalKey(d => d.FileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<File>()
                .HasOne(ds => ds.FilePackage)
                .WithMany(d => d.Files)
                .HasForeignKey(ds => ds.FilePackageId)
                .HasPrincipalKey(d => d.FilePackageId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PollResponse>()
                .HasOne(ds => ds.AssociatedFile)
                .WithMany(d => d.PollResponses)
                .HasForeignKey(ds => ds.AssociatedFileId)
                .HasPrincipalKey(d => d.FileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FilePackage>()
                .HasOne(ds => ds.Dispute)
                .WithMany(d => d.FilePackages)
                .HasForeignKey(ds => ds.DisputeGuid)
                .HasPrincipalKey(d => d.DisputeGuid)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FilePackage>()
                .HasOne(ds => ds.CreatedParticipant)
                .WithMany(d => d.FilePackages)
                .HasForeignKey(ds => ds.CreatedBy)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            // File Package Service
            modelBuilder.Entity<FilePackageService>()
                .HasOne(ds => ds.FilePackage)
                .WithMany(d => d.FilePackageServices)
                .HasForeignKey(ds => ds.FilePackageId)
                .HasPrincipalKey(d => d.FilePackageId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FilePackageService>()
                .HasOne(ds => ds.ProofFileDescription)
                .WithMany(d => d.FilePackageServices)
                .HasForeignKey(ds => ds.ProofFileDescriptionId)
                .HasPrincipalKey(d => d.FileDescriptionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FilePackageService>()
                .HasOne(ds => ds.OtherProofFileDescription)
                .WithMany(d => d.OtherFilePackageServices)
                .HasForeignKey(ds => ds.OtherProofFileDescriptionId)
                .HasPrincipalKey(d => d.FileDescriptionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FilePackageService>()
                .HasOne(ds => ds.Archived)
                .WithMany(d => d.FilePackageServices)
                .HasForeignKey(ds => ds.ArchivedBy)
                .HasPrincipalKey(d => d.SystemUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FilePackageService>()
                .HasOne(ds => ds.ArchiveServed)
                .WithMany(d => d.ArchiveServedFilePackageServices)
                .HasForeignKey(ds => ds.ArchiveServedBy)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        public static void ApplySystemUserRelations(this ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Dispute>().HasOne(ds => ds.SystemUser)
                .WithMany(d => d.Disputes).HasForeignKey(ds => ds.OwnerSystemUserId)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InternalUserRole>().HasOne(ds => ds.SystemUser)
                .WithMany(d => d.InternalUserRoles).HasForeignKey(ds => ds.UserId)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Task>().HasOne(ds => ds.SystemUser)
                .WithMany(d => d.Tasks).HasForeignKey(ds => ds.TaskOwnerId)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Task>().HasOne(ds => ds.LastOwner)
                .WithMany(d => d.LastOwnerTasks).HasForeignKey(ds => ds.LastOwnerId)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AuditLog>().HasOne(ds => ds.SystemUser)
                .WithMany(d => d.AuditLogs).HasForeignKey(ds => ds.SubmitterUserId)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InternalUserProfile>().HasOne(ds => ds.SystemUser)
                .WithMany(d => d.InternalUserProfiles).HasForeignKey(ds => ds.InternalUserId)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AutoText>().HasOne(ds => ds.SystemUser)
                .WithMany(d => d.AutoTexts).HasForeignKey(ds => ds.TextOwner)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ConferenceBridge>().HasOne(ds => ds.SystemUser)
                .WithMany(d => d.ConferenceBridges).HasForeignKey(ds => ds.PreferredOwner)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Hearing>().HasOne(ds => ds.SystemUser1)
                .WithMany(d => d.Hearings1).HasForeignKey(ds => ds.StaffParticipant1)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Hearing>().HasOne(ds => ds.SystemUser2)
                .WithMany(d => d.Hearings2).HasForeignKey(ds => ds.StaffParticipant2)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Hearing>().HasOne(ds => ds.SystemUser3)
                .WithMany(d => d.Hearings3).HasForeignKey(ds => ds.StaffParticipant3)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Hearing>().HasOne(ds => ds.SystemUser4)
                .WithMany(d => d.Hearings4).HasForeignKey(ds => ds.StaffParticipant4)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Hearing>().HasOne(ds => ds.SystemUser5)
                .WithMany(d => d.Hearings5).HasForeignKey(ds => ds.StaffParticipant5)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Hearing>().HasOne(ds => ds.SystemUser)
                .WithMany(d => d.Hearings).HasForeignKey(ds => ds.HearingOwner)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<HearingAuditLog>().HasOne(ds => ds.SystemUser)
                .WithMany(d => d.HearingAuditLogs).HasForeignKey(ds => ds.HearingOwner)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ScheduleBlock>().HasOne(ds => ds.SystemUser)
                .WithMany(d => d.ScheduleBlocks).HasForeignKey(ds => ds.SystemUserId)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ScheduleRequest>().HasOne(ds => ds.RequestorSystemUser)
                .WithMany(d => d.ScheduleRequests).HasForeignKey(ds => ds.RequestorSystemUserId)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ScheduleRequest>().HasOne(ds => ds.RequestSubmitterUser)
                .WithMany(d => d.SubmitterScheduleRequests).HasForeignKey(ds => ds.RequestSubmitter)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ScheduleRequest>().HasOne(ds => ds.RequestOwner)
                .WithMany(d => d.OwnerScheduleRequests).HasForeignKey(ds => ds.RequestOwnerId)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ExternalCustomDataObject>().HasOne(ds => ds.OwnerSystemUser)
                .WithMany(d => d.ExternalCustomDataObjects).HasForeignKey(ds => ds.OwnerId)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DisputeFlag>().HasOne(ds => ds.FlagOwner)
                .WithMany(d => d.DisputeFlags).HasForeignKey(ds => ds.FlagOwnerId)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Participant>().HasOne(ds => ds.SystemUser)
                .WithMany(d => d.Participants).HasForeignKey(ds => ds.SystemUserId)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SystemUser>().HasOne(ds => ds.SystemUserRole)
                .WithMany(d => d.SystemUsers).HasForeignKey(ds => ds.SystemUserRoleId)
                .HasPrincipalKey(d => d.SystemUserRoleId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InternalUserRole>().HasOne(ds => ds.ManagedBy)
                .WithMany(d => d.ManagedByInternalUserRoles).HasForeignKey(ds => ds.ManagedById)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DisputeUser>().HasOne(ds => ds.SystemUser)
                .WithMany(d => d.DisputeUsers).HasForeignKey(ds => ds.SystemUserId)
                .HasPrincipalKey(d => d.SystemUserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Remedy>().HasOne(ds => ds.PrevAward)
                .WithMany(d => d.Remedies).HasForeignKey(ds => ds.PrevAwardBy)
                .HasPrincipalKey(d => d.SystemUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RemedyDetail>().HasOne(ds => ds.Remedy)
                .WithMany(d => d.RemedyDetails).HasForeignKey(ds => ds.RemedyId)
                .HasPrincipalKey(d => d.RemedyId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ExternalErrorLog>().HasOne(ds => ds.ErrorOwnerUser)
                .WithMany(d => d.ExternalErrorLogs).HasForeignKey(ds => ds.ErrorOwner)
                .HasPrincipalKey(d => d.SystemUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ParticipantIdentity>().HasOne(ds => ds.IdentitySystemUser)
                .WithMany(d => d.ParticipantIdentities).HasForeignKey(ds => ds.IdentitySystemUserId)
                .HasPrincipalKey(d => d.SystemUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        public static void ApplyCommonFileRelations(this ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<InternalUserProfile>().HasOne(ds => ds.CommonFileProfilePic)
                .WithMany(d => d.InternalUserProfilesProfilePic).HasForeignKey(ds => ds.ProfilePictureId)
                .HasPrincipalKey(d => d.CommonFileId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InternalUserProfile>().HasOne(ds => ds.CommonFileSignature)
                .WithMany(d => d.InternalUserProfilesSignature).HasForeignKey(ds => ds.SignatureFileId)
                .HasPrincipalKey(d => d.CommonFileId).OnDelete(DeleteBehavior.Restrict);
        }

        public static void ApplyExternalCustomDataObjectRelations(this ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ExternalFile>().HasOne(ds => ds.ExternalCustomDataObject)
                .WithMany(d => d.ExternalFiles).HasForeignKey(ds => ds.ExternalCustomDataObjectId)
                .HasPrincipalKey(d => d.ExternalCustomDataObjectId).OnDelete(DeleteBehavior.Restrict);
        }

        public static void ApplyTrialRelations(this ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TrialDispute>()
                .HasOne(ds => ds.Trial)
                .WithMany(d => d.TrialDisputes)
                .HasForeignKey(ds => ds.TrialGuid)
                .HasPrincipalKey(d => d.TrialGuid)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TrialParticipant>()
                .HasOne(ds => ds.Trial)
                .WithMany(d => d.TrialParticipants)
                .HasForeignKey(ds => ds.TrialGuid)
                .HasPrincipalKey(d => d.TrialGuid)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TrialIntervention>()
                .HasOne(ds => ds.Trial)
                .WithMany(d => d.TrialInterventions)
                .HasForeignKey(ds => ds.TrialGuid)
                .HasPrincipalKey(d => d.TrialGuid)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TrialOutcome>()
                .HasOne(ds => ds.Trial)
                .WithMany(d => d.TrialOutcomes)
                .HasForeignKey(ds => ds.TrialGuid)
                .HasPrincipalKey(d => d.TrialGuid)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Trial>()
                .HasOne(ds => ds.AssociatedTrial)
                .WithMany(d => d.RelatedTrials)
                .HasForeignKey(ds => ds.AssociatedTrialGuid)
                .HasPrincipalKey(d => d.TrialGuid)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TrialDispute>()
                .HasOne(ds => ds.DisputeOptedInByParticipant)
                .WithMany(d => d.TrialDisputes)
                .HasForeignKey(ds => ds.DisputeOptedInByParticipantId)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TrialDispute>()
                .HasOne(ds => ds.DisputeOptedInByStaff)
                .WithMany(d => d.TrialDisputes)
                .HasForeignKey(ds => ds.DisputeOptedInByStaffId)
                .HasPrincipalKey(d => d.SystemUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TrialParticipant>()
                .HasOne(ds => ds.Participant)
                .WithMany(d => d.TrialParticipants)
                .HasForeignKey(ds => ds.ParticipantId)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TrialParticipant>()
                .HasOne(ds => ds.SystemUser)
                .WithMany(d => d.TrialParticipants)
                .HasForeignKey(ds => ds.SystemUserId)
                .HasPrincipalKey(d => d.SystemUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TrialIntervention>()
                .HasOne(ds => ds.TrialDispute)
                .WithMany(d => d.TrialInterventions)
                .HasForeignKey(ds => ds.TrialDisputeGuid)
                .HasPrincipalKey(d => d.TrialDisputeGuid)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TrialIntervention>()
                .HasOne(ds => ds.TrialParticipant)
                .WithMany(d => d.TrialInterventions)
                .HasForeignKey(ds => ds.TrialParticipantGuid)
                .HasPrincipalKey(d => d.TrialParticipantGuid)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TrialOutcome>()
                .HasOne(ds => ds.TrialParticipant)
                .WithMany(d => d.TrialOutcomes)
                .HasForeignKey(ds => ds.TrialParticipantGuid)
                .HasPrincipalKey(d => d.TrialParticipantGuid)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TrialOutcome>()
                .HasOne(ds => ds.TrialDispute)
                .WithMany(d => d.TrialOutcomes)
                .HasForeignKey(ds => ds.TrialDisputeGuid)
                .HasPrincipalKey(d => d.TrialDisputeGuid)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TrialOutcome>()
                .HasOne(ds => ds.TrialIntervention)
                .WithMany(d => d.TrialOutcomes)
                .HasForeignKey(ds => ds.TrialInterventionGuid)
                .HasPrincipalKey(d => d.TrialInterventionGuid)
                .OnDelete(DeleteBehavior.Restrict);
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

            modelBuilder.Entity<Hearing>()
                .HasOne(ds => ds.ConferenceBridge)
                .WithMany(d => d.Hearings)
                .HasForeignKey(ds => ds.ConferenceBridgeId)
                .HasPrincipalKey(d => d.ConferenceBridgeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Hearing>()
                .HasOne(ds => ds.NotificationFileDescription)
                .WithMany(d => d.Hearings)
                .HasForeignKey(ds => ds.NotificationFileDescriptionId)
                .HasPrincipalKey(d => d.FileDescriptionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Hearing>()
                .HasOne(ds => ds.HearingReservedBy)
                .WithMany(d => d.Hearings)
                .HasForeignKey(ds => ds.HearingReservedById)
                .HasPrincipalKey(d => d.UserTokenId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Hearing>()
                .HasOne(ds => ds.HearingReservedDispute)
                .WithMany(d => d.Hearings)
                .HasForeignKey(ds => ds.HearingReservedDisputeGuid)
                .HasPrincipalKey(d => d.DisputeGuid)
                .OnDelete(DeleteBehavior.Restrict);

            // Hearing Participation
            modelBuilder.Entity<HearingParticipation>()
                .HasOne(ds => ds.Hearing)
                .WithMany(d => d.HearingParticipations)
                .HasForeignKey(ds => ds.HearingId)
                .HasPrincipalKey(d => d.HearingId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<HearingParticipation>()
                .HasOne(ds => ds.Participant)
                .WithMany(d => d.HearingParticipations)
                .HasForeignKey(ds => ds.ParticipantId)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<HearingParticipation>()
                .HasOne(ds => ds.ParticipationStatusUser)
                .WithMany(d => d.HearingParticipations)
                .HasForeignKey(ds => ds.ParticipationStatusBy)
                .HasPrincipalKey(d => d.SystemUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<HearingParticipation>()
                .HasOne(ds => ds.PreParticipationStatusUser)
                .WithMany(d => d.PreHearingParticipations)
                .HasForeignKey(ds => ds.PreParticipationStatusBy)
                .HasPrincipalKey(d => d.SystemUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        public static void ApplySubstitutedServicesRelations(this ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<SubstitutedService>()
                .HasOne(ds => ds.Dispute)
                .WithMany(d => d.SubstitutedServices)
                .HasForeignKey(ds => ds.DisputeGuid)
                .HasPrincipalKey(d => d.DisputeGuid)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SubstitutedService>()
                .HasOne(ds => ds.ServiceByParticipant)
                .WithMany(d => d.BySubstitutedServices)
                .HasForeignKey(ds => ds.ServiceByParticipantId)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SubstitutedService>()
                .HasOne(ds => ds.ServiceToParticipant)
                .WithMany(d => d.ToSubstitutedServices)
                .HasForeignKey(ds => ds.ServiceToParticipantId)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SubstitutedService>()
                .HasOne(ds => ds.FailedMethod1FileDesc)
                .WithMany(d => d.SubstitutedServices1)
                .HasForeignKey(ds => ds.FailedMethod1FileDescId)
                .HasPrincipalKey(d => d.FileDescriptionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SubstitutedService>()
                .HasOne(ds => ds.FailedMethod2FileDesc)
                .WithMany(d => d.SubstitutedServices2)
                .HasForeignKey(ds => ds.FailedMethod2FileDescId)
                .HasPrincipalKey(d => d.FileDescriptionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SubstitutedService>()
                .HasOne(ds => ds.FailedMethod3FileDesc)
                .WithMany(d => d.SubstitutedServices3)
                .HasForeignKey(ds => ds.FailedMethod3FileDescId)
                .HasPrincipalKey(d => d.FileDescriptionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SubstitutedService>()
                .HasOne(ds => ds.RequestMethodFileDesc)
                .WithMany(d => d.SubstitutedServices)
                .HasForeignKey(ds => ds.RequestMethodFileDescId)
                .HasPrincipalKey(d => d.FileDescriptionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SubstitutedService>()
                .HasOne(ds => ds.SubServiceApprovedBy)
                .WithMany(d => d.SubstitutedServices)
                .HasForeignKey(ds => ds.SubServiceApprovedById)
                .HasPrincipalKey(d => d.SystemUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        public static void ApplyNoticeRelations(this ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Notice>()
                .HasOne(ds => ds.NoticeFileDescription)
                .WithMany(d => d.Notices)
                .HasForeignKey(ds => ds.NoticeFileDescriptionId)
                .HasPrincipalKey(d => d.FileDescriptionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notice>()
                .HasOne(ds => ds.ParentNotice)
                .WithMany(d => d.ChildNotices)
                .HasForeignKey(ds => ds.ParentNoticeId)
                .HasPrincipalKey(d => d.NoticeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notice>()
                .HasOne(ds => ds.Hearing)
                .WithMany(d => d.Notices)
                .HasForeignKey(ds => ds.HearingId)
                .HasPrincipalKey(d => d.HearingId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notice>()
                .HasOne(ds => ds.ConferenceBridge)
                .WithMany(d => d.Notices)
                .HasForeignKey(ds => ds.ConferenceBridgeId)
                .HasPrincipalKey(d => d.ConferenceBridgeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Amendment>()
                .HasOne(ds => ds.Notice)
                .WithMany(d => d.Amendments)
                .HasForeignKey(ds => ds.NoticeId)
                .HasPrincipalKey(d => d.NoticeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Notice Services
            modelBuilder.Entity<NoticeService>()
                .HasOne(ds => ds.Notice)
                .WithMany(d => d.NoticeServices)
                .HasForeignKey(ds => ds.NoticeId)
                .HasPrincipalKey(d => d.NoticeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<NoticeService>()
                .HasOne(ds => ds.ProofFileDescription)
                .WithMany(d => d.NoticeServices)
                .HasForeignKey(ds => ds.ProofFileDescriptionId)
                .HasPrincipalKey(d => d.FileDescriptionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<NoticeService>()
                .HasOne(ds => ds.OtherProofFileDescription)
                .WithMany(d => d.OtherNoticeServices)
                .HasForeignKey(ds => ds.OtherProofFileDescriptionId)
                .HasPrincipalKey(d => d.FileDescriptionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<NoticeService>()
                .HasOne(ds => ds.Served)
                .WithMany(d => d.ServedNoticeServices)
                .HasForeignKey(ds => ds.ServedBy)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<NoticeService>()
                .HasOne(ds => ds.Archived)
                .WithMany(d => d.NoticeServices)
                .HasForeignKey(ds => ds.ArchivedBy)
                .HasPrincipalKey(d => d.SystemUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<NoticeService>()
                .HasOne(ds => ds.ArchiveServedParticipant)
                .WithMany(d => d.ArchiveServedNoticeServices)
                .HasForeignKey(ds => ds.ArchiveServedBy)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        public static void ApplyServiceAuditLogsRelations(this ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ServiceAuditLog>()
                .HasOne(ds => ds.FilePackageService)
                .WithMany(d => d.ServiceAuditLogs)
                .HasForeignKey(ds => ds.FilePackageServiceId)
                .HasPrincipalKey(d => d.FilePackageServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ServiceAuditLog>()
                .HasOne(ds => ds.NoticeService)
                .WithMany(d => d.ServiceAuditLogs)
                .HasForeignKey(ds => ds.NoticeServiceId)
                .HasPrincipalKey(d => d.NoticeServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ServiceAuditLog>()
                .HasOne(ds => ds.Participant)
                .WithMany(d => d.ServiceAuditLogs)
                .HasForeignKey(ds => ds.ParticipantId)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ServiceAuditLog>()
                .HasOne(ds => ds.ProofFileDescription)
                .WithMany(d => d.ServiceAuditLogs)
                .HasForeignKey(ds => ds.ProofFileDescriptionId)
                .HasPrincipalKey(d => d.FileDescriptionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ServiceAuditLog>()
                .HasOne(ds => ds.OtherProofFileDescription)
                .WithMany(d => d.OtherServiceAuditLogs)
                .HasForeignKey(ds => ds.OtherProofFileDescriptionId)
                .HasPrincipalKey(d => d.FileDescriptionId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        public static void ApplyEmailRelations(this ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<EmailMessage>()
                .HasOne(ds => ds.Participant)
                .WithMany(d => d.EmailMessages)
                .HasForeignKey(ds => ds.ParticipantId)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EmailAttachment>()
                .HasOne(ds => ds.EmailMessage)
                .WithMany(d => d.EmailAttachments)
                .HasForeignKey(ds => ds.EmailMessageId)
                .HasPrincipalKey(d => d.EmailMessageId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EmailAttachment>()
                .HasOne(ds => ds.File)
                .WithMany(d => d.EmailAttachments)
                .HasForeignKey(ds => ds.FileId)
                .HasPrincipalKey(d => d.FileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EmailAttachment>()
                .HasOne(ds => ds.CommonFile)
                .WithMany(d => d.EmailAttachments)
                .HasForeignKey(ds => ds.CommonFileId)
                .HasPrincipalKey(d => d.CommonFileId)
                .OnDelete(DeleteBehavior.Restrict);

            // SubmissionReceipt
            modelBuilder.Entity<SubmissionReceipt>()
                .HasOne(ds => ds.Participant)
                .WithMany(d => d.SubmissionReceipts)
                .HasForeignKey(ds => ds.ParticipantId)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            // Bulk Email Recipients
            modelBuilder.Entity<BulkEmailRecipient>()
                .HasOne(ds => ds.RecipientParticipant)
                .WithMany(d => d.BulkEmailRecipients)
                .HasForeignKey(ds => ds.RecipientParticipantId)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        public static void ApplyOutcomeDocRelations(this ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<OutcomeDocFile>()
                .HasOne(ds => ds.OutcomeDocGroup)
                .WithMany(d => d.OutcomeDocFiles)
                .HasForeignKey(ds => ds.OutcomeDocGroupId)
                .HasPrincipalKey(d => d.OutcomeDocGroupId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OutcomeDocFile>()
                .HasOne(ds => ds.File)
                .WithMany(d => d.OutcomeDocFiles)
                .HasForeignKey(ds => ds.FileId)
                .HasPrincipalKey(d => d.FileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OutcomeDocContent>()
                .HasOne(ds => ds.OutcomeDocFile)
                .WithMany(d => d.OutcomeDocContents)
                .HasForeignKey(ds => ds.OutcomeDocFileId)
                .HasPrincipalKey(d => d.OutcomeDocFileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OutcomeDocDelivery>()
                .HasOne(ds => ds.OutcomeDocFile)
                .WithMany(d => d.OutcomeDocDeliveries)
                .HasForeignKey(ds => ds.OutcomeDocFileId)
                .HasPrincipalKey(d => d.OutcomeDocFileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OutcomeDocDelivery>()
                .HasOne(ds => ds.Participant)
                .WithMany(d => d.OutcomeDocDeliveries)
                .HasForeignKey(ds => ds.ParticipantId)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OutcomeDocDelivery>()
                .HasOne(ds => ds.AssociatedEmail)
                .WithMany(d => d.OutcomeDocDeliveries)
                .HasForeignKey(ds => ds.AssociatedEmailId)
                .HasPrincipalKey(d => d.EmailMessageId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OutcomeDocRequest>()
                .HasOne(ds => ds.OutcomeDocGroup)
                .WithMany(d => d.OutcomeDocRequests)
                .HasForeignKey(ds => ds.OutcomeDocGroupId)
                .HasPrincipalKey(d => d.OutcomeDocGroupId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OutcomeDocRequest>()
                .HasOne(ds => ds.FileDescription)
                .WithMany(d => d.OutcomeDocRequests)
                .HasForeignKey(ds => ds.FileDescriptionId)
                .HasPrincipalKey(d => d.FileDescriptionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OutcomeDocReqItem>()
                .HasOne(ds => ds.OutcomeDocRequest)
                .WithMany(d => d.OutcomeDocReqItems)
                .HasForeignKey(ds => ds.OutcomeDocRequestId)
                .HasPrincipalKey(d => d.OutcomeDocRequestId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OutcomeDocReqItem>()
                .HasOne(ds => ds.FileDescription)
                .WithMany(d => d.OutcomeDocReqItems)
                .HasForeignKey(ds => ds.FileDescriptionId)
                .HasPrincipalKey(d => d.FileDescriptionId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        public static void ApplyPollRelations(this ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<PollResponse>()
                .HasOne(ds => ds.Poll)
                .WithMany(d => d.PollResponses)
                .HasForeignKey(ds => ds.PollId)
                .HasPrincipalKey(d => d.PollId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        public static void ApplyOnlineMeetingRelations(this ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<DisputeLink>()
                .HasOne(ds => ds.OnlineMeeting)
                .WithMany(d => d.DisputeLinks)
                .HasForeignKey(ds => ds.OnlineMeetingId)
                .HasPrincipalKey(d => d.OnlineMeetingId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        public static void ApplyDisputeVerificationRelations(this ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<DisputeVerification>()
                .HasOne(ds => ds.Dispute)
                .WithMany(d => d.DisputeVerifications)
                .HasForeignKey(ds => ds.DisputeGuid)
                .HasPrincipalKey(d => d.DisputeGuid)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DisputeVerification>()
                .HasOne(ds => ds.Hearing)
                .WithMany(d => d.DisputeVerifications)
                .HasForeignKey(ds => ds.HearingId)
                .HasPrincipalKey(d => d.HearingId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DisputeVerification>()
                .HasOne(ds => ds.DisputeFee)
                .WithMany(d => d.DisputeVerifications)
                .HasForeignKey(ds => ds.DisputeFeeId)
                .HasPrincipalKey(d => d.DisputeFeeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DisputeVerification>()
                .HasOne(ds => ds.RefundInitiated)
                .WithMany(d => d.DisputeVerifications)
                .HasForeignKey(ds => ds.RefundInitiatedBy)
                .HasPrincipalKey(d => d.SystemUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // VerificationAttempt
            modelBuilder.Entity<VerificationAttempt>()
                .HasOne(ds => ds.Participant)
                .WithMany(d => d.VerificationAttempts)
                .HasForeignKey(ds => ds.ParticipantId)
                .HasPrincipalKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<VerificationAttempt>()
                .HasOne(ds => ds.DisputeVerification)
                .WithMany(d => d.VerificationAttempts)
                .HasForeignKey(ds => ds.DisputeVerificationId)
                .HasPrincipalKey(d => d.VerificationId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
