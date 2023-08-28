using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model.AdHocFile;
using CM.Data.Model.Context;
using CM.Data.Model.HearingReport;
using CM.Data.Model.Search;
using CM.UserResolverService;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Model;

public sealed partial class CaseManagementContext : DbContext
{
    private readonly IUserResolver _userResolver;

    public CaseManagementContext(DbContextOptions<CaseManagementContext> options, IUserResolver userResolver)
        : base(options)
    {
        _userResolver = userResolver;
    }

    public DbSet<Dispute> Disputes { get; set; }

    public DbSet<DisputeStatus> DisputeStatuses { get; set; }

    public DbSet<DisputeProcessDetail> DisputeProcessDetails { get; set; }

    public DbSet<Participant> Participants { get; set; }

    public DbSet<SystemUser> SystemUsers { get; set; }

    public DbSet<SystemUserRole> SystemUserRoles { get; set; }

    public DbSet<DisputeUser> DisputeUsers { get; set; }

    public DbSet<AccessCodeExcludeWord> AccessCodeExcludeWords { get; set; }

    public DbSet<AuditLog> AuditLogs { get; set; }

    public DbSet<Amendment> Amendments { get; set; }

    public DbSet<ClaimGroup> ClaimGroups { get; set; }

    public DbSet<Claim> Claims { get; set; }

    public DbSet<ClaimDetail> ClaimDetails { get; set; }

    public DbSet<ClaimGroupParticipant> ClaimGroupParticipants { get; set; }

    public DbSet<Remedy> Remedies { get; set; }

    public DbSet<RemedyDetail> RemedyDetails { get; set; }

    public DbSet<IntakeQuestion> IntakeQuestions { get; set; }

    public DbSet<HearingParticipation> HearingParticipations { get; set; }

    public DbSet<File> Files { get; set; }

    public DbSet<FileDescription> FileDescriptions { get; set; }

    public DbSet<LinkedFile> LinkedFiles { get; set; }

    public DbSet<Note> Notes { get; set; }

    public DbSet<Notice> Notices { get; set; }

    public DbSet<NoticeService> NoticeServices { get; set; }

    public DbSet<DisputeFee> DisputeFees { get; set; }

    public DbSet<PaymentTransaction> PaymentTransactions { get; set; }

    public DbSet<EmailMessage> EmailMessages { get; set; }

    public DbSet<EmailAttachment> EmailAttachments { get; set; }

    public DbSet<EmailTemplate> EmailTemplates { get; set; }

    public DbSet<CommonFile> CommonFiles { get; set; }

    public DbSet<InternalUserRole> InternalUserRoles { get; set; }

    public DbSet<Task> Tasks { get; set; }

    public DbSet<SystemSettings> SystemSettings { get; set; }

    public DbSet<UserToken> UserTokens { get; set; }

    public DbSet<FilePackage> FilePackages { get; set; }

    public DbSet<FilePackageService> FilePackageServices { get; set; }

    public DbSet<Maintenance> Maintenance { get; set; }

    public DbSet<InternalUserProfile> InternalUserProfiles { get; set; }

    public DbSet<OutcomeDocGroup> OutcomeDocGroups { get; set; }

    public DbSet<OutcomeDocFile> OutcomeDocFiles { get; set; }

    public DbSet<OutcomeDocContent> OutcomeDocContents { get; set; }

    public DbSet<OutcomeDocDelivery> OutcomeDocDeliveries { get; set; }

    public DbSet<AutoText> AutoTexts { get; set; }

    public DbSet<DataModel> CMSData { get; set; }

    public DbSet<CMSParticipant> CMSParticipants { get; set; }

    public DbSet<CMSFile> CMSFiles { get; set; }

    public DbSet<CMSCorrection> CMSCorrections { get; set; }

    public DbSet<CMSArchiveNote> CMSArchiveNotes { get; set; }

    public DbSet<ConferenceBridge> ConferenceBridges { get; set; }

    public DbSet<DisputeHearing> DisputeHearings { get; set; }

    public DbSet<Hearing> Hearings { get; set; }

    public DbSet<ServiceOffice> ServiceOffices { get; set; }

    public DbSet<HearingImport> HearingImports { get; set; }

    public DbSet<SiteVersion> SiteVersion { get; set; }

    public DbSet<SubstitutedService> SubstitutedServices { get; set; }

    public DbSet<CrossApplicationParticipant> CrossApplicationParticipants { get; set; }

    public DbSet<DisputeLastModified> DisputesLastModified { get; set; }

    public DbSet<ArbitrationScheduleHearing> ArbitrationScheduleHearings { get; set; }

    public DbSet<ArbitrationScheduleIssue> ArbitrationScheduleIssues { get; set; }

    public DbSet<BulkEmailRecipient> BulkEmailRecipients { get; set; }

    public DbSet<HearingAuditLog> HearingAuditLogs { get; set; }

    public DbSet<CustomDataObject> CustomDataObjects { get; set; }

    public DbSet<ExternalCustomDataObject> ExternalCustomDataObjects { get; set; }

    public DbSet<ExternalFile> ExternalFiles { get; set; }

    public DbSet<SchedulePeriod> SchedulePeriods { get; set; }

    public DbSet<ScheduleBlock> ScheduleBlocks { get; set; }

    public DbSet<ScheduleRequest> ScheduleRequests { get; set; }

    public DbSet<OutcomeDocRequest> OutcomeDocRequests { get; set; }

    public DbSet<OutcomeDocReqItem> OutcomeDocReqItems { get; set; }

    public DbSet<DisputeFlag> DisputeFlags { get; set; }

    public DbSet<SubmissionReceipt> SubmissionReceipts { get; set; }

    public DbSet<Trial> Trials { get; set; }

    public DbSet<TrialDispute> TrialDisputes { get; set; }

    public DbSet<TrialParticipant> TrialParticipants { get; set; }

    public DbSet<TrialIntervention> TrialInterventions { get; set; }

    public DbSet<TrialOutcome> TrialOutcomes { get; set; }

    public DbSet<CustomConfigObject> CustomConfigObjects { get; set; }

    public DbSet<AdHocFileCleanup> AdHocFileCleanup { get; set; }

    public DbSet<AdHocFileCleanupTracking> AdHocFileCleanupTracking { get; set; }

    public DbSet<ServiceAuditLog> ServiceAuditLogs { get; set; }

    public DbSet<ExternalErrorLog> ExternalErrorLogs { get; set; }

    public DbSet<Poll> Polls { get; set; }

    public DbSet<PollResponse> PollResponses { get; set; }

    public DbSet<ParticipantIdentity> ParticipantIdentities { get; set; }

    public DbSet<OnlineMeeting> OnlineMeetings { get; set; }

    public DbSet<DisputeLink> DisputeLinks { get; set; }

    public DbSet<DisputeVerification> DisputeVerifications { get; set; }

    public DbSet<VerificationAttempt> VerificationAttempts { get; set; }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        AddTimestamps();
        var result = SaveChangesAsyncEx(cancellationToken);

        return await result;
    }

    public async Task<int> SaveChangesWithNoTrackingAsync(CancellationToken cancellationToken = default)
    {
        var result = await base.SaveChangesAsync(true, cancellationToken);

        return result;
    }

    public override int SaveChanges()
    {
        AddTimestamps();

        return SaveChangesAsyncEx(CancellationToken.None)
            .Result;
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess,
        CancellationToken cancellationToken = default)
    {
        AddTimestamps();

        return SaveChangesAsyncEx(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ////TODO: Disables identity columns generation. See link below.
        //// https://github.com/npgsql/efcore.pg/issues/1064
        modelBuilder.UseSerialColumns();
        modelBuilder.AddViewsAndCustomSets();
        modelBuilder.ApplyRelations();
        modelBuilder.ApplyIndexes();
        modelBuilder.ApplyUniqueIndexes();
        modelBuilder.ApplyIsDeletedFilter();
        modelBuilder.ApplyColumnsCustomTypes();
        modelBuilder.AddDefaultValues();
    }

    private void AddTimestamps()
    {
        var entities = ChangeTracker.Entries()
            .Where(x => x.Entity is BaseEntity && x.State is EntityState.Added or EntityState.Modified);
        {
            var userId = _userResolver.GetUserId();

            foreach (var entity in entities)
            {
                switch (entity.State)
                {
                    case EntityState.Added when entity.Entity.GetType() == typeof(Hearing) &&
                                                ((BaseEntity)entity.Entity).CreatedBy != null:
                    case EntityState.Added when entity.Entity.GetType() == typeof(HearingAuditLog) &&
                                                ((BaseEntity)entity.Entity).CreatedBy != null:
                        continue;
                    case EntityState.Added
                        when ((BaseEntity)entity.Entity).CreatedBy == Constants.UndefinedUserId ||
                             ((BaseEntity)entity.Entity).ModifiedBy == Constants.UndefinedUserId:
                        ((BaseEntity)entity.Entity).CreatedDate = DateTime.UtcNow;
                        ((BaseEntity)entity.Entity).CreatedBy = Constants.UndefinedUserId;
                        ((BaseEntity)entity.Entity).ModifiedDate = DateTime.UtcNow;
                        ((BaseEntity)entity.Entity).ModifiedBy = Constants.UndefinedUserId;

                        continue;
                    case EntityState.Added:
                        ((BaseEntity)entity.Entity).CreatedDate = DateTime.UtcNow;
                        ((BaseEntity)entity.Entity).CreatedBy = userId;

                        break;
                    case EntityState.Modified
                        when ((BaseEntity)entity.Entity).ModifiedBy == Constants.UndefinedUserId &&
                             entity.Entity.GetType() != typeof(SystemUser):
                        ((BaseEntity)entity.Entity).ModifiedDate = DateTime.UtcNow;

                        continue;
                }

                ((BaseEntity)entity.Entity).ModifiedDate = DateTime.UtcNow;
                ((BaseEntity)entity.Entity).ModifiedBy = userId;
            }
        }
    }
}