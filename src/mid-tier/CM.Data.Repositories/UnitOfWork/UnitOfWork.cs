using System;
using System.Data.Common;
using System.Diagnostics;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Amendment;
using CM.Data.Repositories.AuditLogs;
using CM.Data.Repositories.AutoText;
using CM.Data.Repositories.BulkEmailRecipient;
using CM.Data.Repositories.Claim;
using CM.Data.Repositories.CmsArchive;
using CM.Data.Repositories.ConferenceBridge;
using CM.Data.Repositories.CustomConfigObject;
using CM.Data.Repositories.CustomDataObject;
using CM.Data.Repositories.Dispute;
using CM.Data.Repositories.DisputeFlag;
using CM.Data.Repositories.DisputeHearing;
using CM.Data.Repositories.DisputeProcessDetail;
using CM.Data.Repositories.DisputeStatus;
using CM.Data.Repositories.EmailAttachment;
using CM.Data.Repositories.EmailMessage;
using CM.Data.Repositories.EmailTemplate;
using CM.Data.Repositories.ExcludeWord;
using CM.Data.Repositories.ExternalCustomDataObject;
using CM.Data.Repositories.ExternalFile;
using CM.Data.Repositories.FilePackageService;
using CM.Data.Repositories.Files;
using CM.Data.Repositories.Hearings;
using CM.Data.Repositories.IntakeQuestions;
using CM.Data.Repositories.InternalUserProfile;
using CM.Data.Repositories.InternalUserRole;
using CM.Data.Repositories.Maintenance;
using CM.Data.Repositories.Notes;
using CM.Data.Repositories.Notice;
using CM.Data.Repositories.OutcomeDocRequest;
using CM.Data.Repositories.OutcomeDocument;
using CM.Data.Repositories.Parties;
using CM.Data.Repositories.Payment;
using CM.Data.Repositories.Remedy;
using CM.Data.Repositories.Role;
using CM.Data.Repositories.ScheduleBlock;
using CM.Data.Repositories.SchedulePeriod;
using CM.Data.Repositories.ScheduleRequest;
using CM.Data.Repositories.Search;
using CM.Data.Repositories.SiteVersion;
using CM.Data.Repositories.SubmissionReceipt;
using CM.Data.Repositories.SubstitutedService;
using CM.Data.Repositories.SystemSettings;
using CM.Data.Repositories.Task;
using CM.Data.Repositories.Token;
using CM.Data.Repositories.Trial;
using CM.Data.Repositories.TrialDispute;
using CM.Data.Repositories.TrialIntervention;
using CM.Data.Repositories.TrialOutcome;
using CM.Data.Repositories.TrialParticipant;
using CM.Data.Repositories.User;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace CM.Data.Repositories.UnitOfWork;

public class UnitOfWork : IUnitOfWork
{
    private readonly IAmendmentRepository _amendmentRepository = null;

    private readonly IAuditLogRepository _auditLogRepository = null;

    private readonly IAutoTextRepository _autoTextRepository = null;

    private readonly IBulkEmailRecipientRepository _bulkEmailRecipientRepository = null;

    private readonly IClaimDetailRepository _claimDetailRepository = null;

    private readonly IClaimGroupParticipantRepository _claimGroupParticipantRepository = null;

    private readonly IClaimGroupRepository _claimGroupRepository = null;

    private readonly IClaimRepository _claimRepository = null;

    private readonly ICmsArchiveNoteRepository _cmsArchiveNoteRepository = null;

    private readonly IDataModelRepository _cmsArchiveSearchRepository = null;

    private readonly ICmsCorrectionRepository _cmsCorrectionRepository = null;

    private readonly ICmsFileRepository _cmsFileRepository = null;

    private readonly ICmsParticipantRepository _cmsParticipantRepository = null;

    private readonly ICommonFileRepository _commonFileRepository = null;

    private readonly IConferenceBridgeRepository _conferenceBridgeRepository = null;
    private readonly CaseManagementContext _context;

    private readonly ICustomConfigObjectRepository _customConfigObjectRepository = null;

    private readonly ICustomDataObjectRepository _customDataObjectRepository = null;

    private readonly IDisputeFeeRepository _disputeFeeRepository = null;

    private readonly IDisputeFlagRepository _disputeFlagRepository = null;

    private readonly IDisputeHearingRepository _disputeHearingRepository = null;

    private readonly IDisputeProcessDetailRepository _disputeProcessDetailRepository = null;

    private readonly IDisputeRepository _disputeRepository = null;

    private readonly IDisputeStatusRepository _disputeStatusRepository = null;

    private readonly IDisputeUserRepository _disputeUserRepository = null;

    private readonly IEmailAttachmentRepository _emailAttachmentRepository = null;

    private readonly IEmailMessageRepository _emailMessageRepository = null;

    private readonly IEmailTemplateRepository _emailTemplateRepository = null;

    private readonly IExcludeWordRepository _excludeWordRepository = null;

    private readonly IExternalCustomDataObjectRepository _externalCustomDataObjectRepository = null;

    private readonly IExternalFileRepository _externalFileRepository = null;

    private readonly IFileDescriptionRepository _fileDescriptionRepository = null;

    private readonly IFilePackageRepository _filePackageRepository = null;

    private readonly IFilePackageServiceRepository _filePackageServiceRepository = null;

    private readonly IFileRepository _fileRepository = null;

    private readonly IHearingAuditLogRepository _hearingAuditLogRepository = null;

    private readonly IHearingParticipationRepository _hearingParticipationRepository = null;

    private readonly IHearingRepository _hearingRepository = null;

    private readonly IImportHearingRepository _importHearingRepository = null;

    private readonly IIntakeQuestionsRepository _intakeQuestionsRepository = null;

    private readonly IInternalUserProfileRepository _internalUserProfileRepository = null;

    private readonly IInternalUserRoleRepository _internalUserRoleRepository = null;

    private readonly ILinkedFileRepository _linkedFileRepository = null;

    private readonly IMaintenanceRepository _maintenanceRepository = null;

    private readonly INoteRepository _noteRepository = null;

    private readonly INoticeRepository _noticeRepository = null;

    private readonly INoticeServiceRepository _noticeServiceRepository = null;

    private readonly IOutcomeDocContentRepository _outcomeDocContentRepository = null;

    private readonly IOutcomeDocDeliveryRepository _outcomeDocDeliveryRepository = null;

    private readonly IOutcomeDocFileRepository _outcomeDocFileRepository = null;

    private readonly IOutcomeDocGroupRepository _outcomeDocGroupRepository = null;

    private readonly IOutcomeDocRequestItemRepository _outcomeDocRequestItemRepository = null;

    private readonly IOutcomeDocRequestRepository _outcomeDocRequestRepository = null;

    private readonly IParticipantRepository _participantRepository = null;

    private readonly IPaymentTransactionRepository _paymentTransactionRepository = null;

    private readonly IRemedyDetailRepository _remedyDetailRepository = null;

    private readonly IRemedyRepository _remedyRepository = null;

    private readonly IRoleRepository _roleRepository = null;

    private readonly IScheduleBlockRepository _scheduleBlockRepository = null;

    private readonly ISchedulePeriodRepository _schedulePeriodRepository = null;

    private readonly IScheduleRequestRepository _scheduleRequestRepository = null;

    private readonly ISearchRepository _searchRepository = null;

    private readonly ISiteVersionRepository _siteVersionRepository = null;

    private readonly ISubmissionReceiptRepository _submissionReceiptRepository = null;

    private readonly ISubstitutedServiceRepository _substitutedServiceRepository = null;

    private readonly ISystemSettingsRepository _systemSettingsRepository = null;

    private readonly ISystemUserRepository _systemUserRepository = null;

    private readonly ITaskRepository _taskRepository = null;

    private readonly ITokenRepository _tokenRepository = null;

    private readonly ITrialDisputeRepository _trialDisputeRepository = null;

    private readonly ITrialInterventionRepository _trialInterventionRepository = null;

    private readonly ITrialOutcomeRepository _trialOutcomeRepository = null;

    private readonly ITrialParticipantRepository _trialParticipantRepository = null;

    private readonly ITrialRepository _trialRepository = null;

    public UnitOfWork(CaseManagementContext context)
    {
        _context = context;
    }

    public IDisputeRepository DisputeRepository => _disputeRepository ?? new DisputeRepository(_context);

    public ITokenRepository TokenRepository => _tokenRepository ?? new TokenRepository(_context);

    public IDisputeUserRepository DisputeUserRepository =>
        _disputeUserRepository ?? new DisputeUserRepository(_context);

    public ISystemUserRepository SystemUserRepository =>
        _systemUserRepository ?? new SystemUserRepository(_context);

    public IRoleRepository RoleRepository => _roleRepository ?? new RoleRepository(_context);

    public ISystemSettingsRepository SystemSettingsRepository =>
        _systemSettingsRepository ?? new SystemSettingsRepository(_context);

    public IIntakeQuestionsRepository IntakeQuestionsRepository =>
        _intakeQuestionsRepository ?? new IntakeQuestionsRepository(_context);

    public IDisputeStatusRepository DisputeStatusRepository =>
        _disputeStatusRepository ?? new DisputeStatusRepository(_context);

    public IDisputeProcessDetailRepository DisputeProcessDetailRepository =>
        _disputeProcessDetailRepository ?? new DisputeProcessDetailRepository(_context);

    public IClaimGroupRepository ClaimGroupRepository =>
        _claimGroupRepository ?? new ClaimGroupRepository(_context);

    public IParticipantRepository ParticipantRepository =>
        _participantRepository ?? new ParticipantRepository(_context);

    public IClaimGroupParticipantRepository ClaimGroupParticipantRepository =>
        _claimGroupParticipantRepository ?? new ClaimGroupParticipantRepository(_context);

    public IExcludeWordRepository ExcludeWordRepository =>
        _excludeWordRepository ?? new ExcludeWordRepository(_context);

    public IAuditLogRepository AuditLogRepository => _auditLogRepository ?? new AuditLogRepository(_context);

    public IClaimRepository ClaimRepository => _claimRepository ?? new ClaimRepository(_context);

    public IClaimDetailRepository ClaimDetailRepository =>
        _claimDetailRepository ?? new ClaimDetailRepository(_context);

    public IRemedyRepository RemedyRepository => _remedyRepository ?? new RemedyRepository(_context);

    public IRemedyDetailRepository RemedyDetailRepository =>
        _remedyDetailRepository ?? new RemedyDetailRepository(_context);

    public IEmailMessageRepository EmailMessageRepository =>
        _emailMessageRepository ?? new EmailMessageRepository(_context);

    public IEmailAttachmentRepository EmailAttachmentRepository =>
        _emailAttachmentRepository ?? new EmailAttachmentRepository(_context);

    public IEmailTemplateRepository EmailTemplateRepository =>
        _emailTemplateRepository ?? new EmailTemplateRepository(_context);

    public IDisputeFeeRepository DisputeFeeRepository =>
        _disputeFeeRepository ?? new DisputeFeeRepository(_context);

    public IPaymentTransactionRepository PaymentTransactionRepository =>
        _paymentTransactionRepository ?? new PaymentTransactionRepository(_context);

    public IHearingParticipationRepository HearingParticipationRepository =>
        _hearingParticipationRepository ?? new HearingParticipationRepository(_context);

    public IFileDescriptionRepository FileDescriptionRepository =>
        _fileDescriptionRepository ?? new FileDescriptionRepository(_context);

    public ILinkedFileRepository LinkedFileRepository =>
        _linkedFileRepository ?? new LinkedFileRepository(_context);

    public ISearchRepository SearchRepository => _searchRepository ?? new SearchRepository(_context);

    public IFileRepository FileRepository => _fileRepository ?? new FileRepository(_context);

    public ICommonFileRepository CommonFileRepository =>
        _commonFileRepository ?? new CommonFileRepository(_context);

    public INoticeRepository NoticeRepository => _noticeRepository ?? new NoticeRepository(_context);

    public INoticeServiceRepository NoticeServiceRepository =>
        _noticeServiceRepository ?? new NoticeServiceRepository(_context);

    public IInternalUserRoleRepository InternalUserRoleRepository =>
        _internalUserRoleRepository ?? new InternalUserRoleRepository(_context);

    public IInternalUserProfileRepository InternalUserProfileRepository =>
        _internalUserProfileRepository ?? new InternalUserProfileRepository(_context);

    public IAmendmentRepository AmendmentRepository => _amendmentRepository ?? new AmendmentRepository(_context);

    public INoteRepository NoteRepository => _noteRepository ?? new NoteRepository(_context);

    public ITaskRepository TaskRepository => _taskRepository ?? new TaskRepository(_context);

    public IMaintenanceRepository MaintenanceRepository =>
        _maintenanceRepository ?? new MaintenanceRepository(_context);

    public IFilePackageRepository FilePackageRepository =>
        _filePackageRepository ?? new FilePackageRepository(_context);

    public IFilePackageServiceRepository FilePackageServiceRepository =>
        _filePackageServiceRepository ?? new FilePackageServiceRepository(_context);

    public IOutcomeDocGroupRepository OutcomeDocGroupRepository =>
        _outcomeDocGroupRepository ?? new OutcomeDocGroupRepository(_context);

    public IOutcomeDocFileRepository OutcomeDocFileRepository =>
        _outcomeDocFileRepository ?? new OutcomeDocFileRepository(_context);

    public IOutcomeDocContentRepository OutcomeDocContentRepository =>
        _outcomeDocContentRepository ?? new OutcomeDocContentRepository(_context);

    public IOutcomeDocDeliveryRepository OutcomeDocDeliveryRepository =>
        _outcomeDocDeliveryRepository ?? new OutcomeDocDeliveryRepository(_context);

    public IAutoTextRepository AutoTextRepository => _autoTextRepository ?? new AutoTextRepository(_context);

    public IDataModelRepository DataModelRepository =>
        _cmsArchiveSearchRepository ?? new DataModelRepository(_context);

    public ICmsParticipantRepository CmsParticipantRepository =>
        _cmsParticipantRepository ?? new CmsParticipantRepository(_context);

    public ICmsArchiveNoteRepository CmsArchiveNoteRepository =>
        _cmsArchiveNoteRepository ?? new CmsArchiveNoteRepository(_context);

    public ICmsFileRepository CmsFileRepository => _cmsFileRepository ?? new CmsFileRepository(_context);

    public ICmsCorrectionRepository CmsCorrectionRepository =>
        _cmsCorrectionRepository ?? new CmsCorrectionRepository(_context);

    public IConferenceBridgeRepository ConferenceBridgeRepository =>
        _conferenceBridgeRepository ?? new ConferenceBridgeRepository(_context);

    public IDisputeHearingRepository DisputeHearingRepository =>
        _disputeHearingRepository ?? new DisputeHearingRepository(_context);

    public IHearingRepository HearingRepository => _hearingRepository ?? new HearingRepository(_context);

    public IImportHearingRepository ImportHearingRepository =>
        _importHearingRepository ?? new ImportHearingRepository(_context);

    public ISiteVersionRepository SiteVersionRepository =>
        _siteVersionRepository ?? new SiteVersionRepository(_context);

    public ISubstitutedServiceRepository SubstitutedServiceRepository =>
        _substitutedServiceRepository ?? new SubstitutedServiceRepository(_context);

    public IBulkEmailRecipientRepository BulkEmailRecipientRepository =>
        _bulkEmailRecipientRepository ?? new BulkEmailRecipientRepository(_context);

    public IHearingAuditLogRepository HearingAuditLogRepository =>
        _hearingAuditLogRepository ?? new HearingAuditLogRepository(_context);

    public ICustomDataObjectRepository CustomDataObjectRepository =>
        _customDataObjectRepository ?? new CustomDataObjectRepository(_context);

    public IExternalCustomDataObjectRepository ExternalCustomDataObjectRepository =>
        _externalCustomDataObjectRepository ?? new ExternalCustomDataObjectRepository(_context);

    public ISchedulePeriodRepository SchedulePeriodRepository =>
        _schedulePeriodRepository ?? new SchedulePeriodRepository(_context);

    public IScheduleBlockRepository ScheduleBlockRepository =>
        _scheduleBlockRepository ?? new ScheduleBlockRepository(_context);

    public IScheduleRequestRepository ScheduleRequestRepository =>
        _scheduleRequestRepository ?? new ScheduleRequestRepository(_context);

    public IOutcomeDocRequestRepository OutcomeDocRequestRepository =>
        _outcomeDocRequestRepository ?? new OutcomeDocRequestRepository(_context);

    public IOutcomeDocRequestItemRepository OutcomeDocRequestItemRepository =>
        _outcomeDocRequestItemRepository ?? new OutcomeDocRequestItemRepository(_context);

    public IDisputeFlagRepository DisputeFlagRepository =>
        _disputeFlagRepository ?? new DisputeFlagRepository(_context);

    public ISubmissionReceiptRepository SubmissionReceiptRepository =>
        _submissionReceiptRepository ?? new SubmissionReceiptRepository(_context);

    public ITrialRepository TrialRepository => _trialRepository ?? new TrialRepository(_context);

    public ITrialDisputeRepository TrialDisputeRepository =>
        _trialDisputeRepository ?? new TrialDisputeRepository(_context);

    public ITrialParticipantRepository TrialParticipantRepository =>
        _trialParticipantRepository ?? new TrialParticipantRepository(_context);

    public ITrialInterventionRepository TrialInterventionRepository =>
        _trialInterventionRepository ?? new TrialInterventionRepository(_context);

    public ITrialOutcomeRepository TrialOutcomeRepository =>
        _trialOutcomeRepository ?? new TrialOutcomeRepository(_context);

    public ICustomConfigObjectRepository CustomConfigObjectRepository =>
        _customConfigObjectRepository ?? new CustomConfigObjectRepository(_context);

    public IExternalFileRepository ExternalFileRepository =>
        _externalFileRepository ?? new ExternalFileRepository(_context);

    public async Task<int> Complete(bool withNoTracking = false)
    {
        await using var scope = await _context.Database.BeginTransactionAsync();

        try
        {
            var res = withNoTracking
                ? await _context.SaveChangesWithNoTrackingAsync()
                : await _context.SaveChangesAsync();

            await scope.CommitAsync();

            return res;
        }
        catch (DbException ex)
        {
            await scope.RollbackAsync();
            Debug.WriteLine(ex.Message);

            return await System.Threading.Tasks.Task.FromResult(ex.ErrorCode);
        }
        catch (InvalidOperationException ex)
        {
            Debug.WriteLine(ex.Message);

            throw;
        }
        catch (DbUpdateConcurrencyException ex)
        {
            Debug.WriteLine(ex.Message);

            throw;
        }
        catch (Exception ex)
        {
            Debug.WriteLine(ex.Message);

            throw;
        }
    }

    public IDbContextTransaction BeginTransaction()
    {
        return _context.Database.BeginTransaction();
    }
}