using System.Threading.Tasks;
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
using Microsoft.EntityFrameworkCore.Storage;

namespace CM.Data.Repositories.UnitOfWork;

public interface IUnitOfWork
{
    IDisputeRepository DisputeRepository { get; }

    ITokenRepository TokenRepository { get; }

    IDisputeUserRepository DisputeUserRepository { get; }

    ISystemUserRepository SystemUserRepository { get; }

    IRoleRepository RoleRepository { get; }

    ISystemSettingsRepository SystemSettingsRepository { get; }

    IIntakeQuestionsRepository IntakeQuestionsRepository { get; }

    IDisputeStatusRepository DisputeStatusRepository { get; }

    IDisputeProcessDetailRepository DisputeProcessDetailRepository { get; }

    IAuditLogRepository AuditLogRepository { get; }

    IClaimGroupRepository ClaimGroupRepository { get; }

    IParticipantRepository ParticipantRepository { get; }

    IClaimGroupParticipantRepository ClaimGroupParticipantRepository { get; }

    IExcludeWordRepository ExcludeWordRepository { get; }

    IClaimRepository ClaimRepository { get; }

    IClaimDetailRepository ClaimDetailRepository { get; }

    IRemedyRepository RemedyRepository { get; }

    IRemedyDetailRepository RemedyDetailRepository { get; }

    IEmailMessageRepository EmailMessageRepository { get; }

    IEmailAttachmentRepository EmailAttachmentRepository { get; }

    IEmailTemplateRepository EmailTemplateRepository { get; }

    IHearingParticipationRepository HearingParticipationRepository { get; }

    IDisputeFeeRepository DisputeFeeRepository { get; }

    IPaymentTransactionRepository PaymentTransactionRepository { get; }

    IFileDescriptionRepository FileDescriptionRepository { get; }

    ISearchRepository SearchRepository { get; }

    IFileRepository FileRepository { get; }

    ILinkedFileRepository LinkedFileRepository { get; }

    ICommonFileRepository CommonFileRepository { get; }

    INoticeRepository NoticeRepository { get; }

    INoticeServiceRepository NoticeServiceRepository { get; }

    IInternalUserRoleRepository InternalUserRoleRepository { get; }

    IInternalUserProfileRepository InternalUserProfileRepository { get; }

    IAmendmentRepository AmendmentRepository { get; }

    INoteRepository NoteRepository { get; }

    ITaskRepository TaskRepository { get; }

    IMaintenanceRepository MaintenanceRepository { get; }

    IFilePackageRepository FilePackageRepository { get; }

    IFilePackageServiceRepository FilePackageServiceRepository { get; }

    IOutcomeDocGroupRepository OutcomeDocGroupRepository { get; }

    IOutcomeDocFileRepository OutcomeDocFileRepository { get; }

    IOutcomeDocContentRepository OutcomeDocContentRepository { get; }

    IOutcomeDocDeliveryRepository OutcomeDocDeliveryRepository { get; }

    IAutoTextRepository AutoTextRepository { get; }

    IDataModelRepository DataModelRepository { get; }

    ICmsParticipantRepository CmsParticipantRepository { get; }

    ICmsArchiveNoteRepository CmsArchiveNoteRepository { get; }

    ICmsFileRepository CmsFileRepository { get; }

    ICmsCorrectionRepository CmsCorrectionRepository { get; }

    IConferenceBridgeRepository ConferenceBridgeRepository { get; }

    IDisputeHearingRepository DisputeHearingRepository { get; }

    IHearingRepository HearingRepository { get; }

    IImportHearingRepository ImportHearingRepository { get; }

    ISiteVersionRepository SiteVersionRepository { get; }

    ISubstitutedServiceRepository SubstitutedServiceRepository { get; }

    IBulkEmailRecipientRepository BulkEmailRecipientRepository { get; }

    IHearingAuditLogRepository HearingAuditLogRepository { get; }

    ICustomDataObjectRepository CustomDataObjectRepository { get; }

    IExternalCustomDataObjectRepository ExternalCustomDataObjectRepository { get; }

    IExternalFileRepository ExternalFileRepository { get; }

    ISchedulePeriodRepository SchedulePeriodRepository { get; }

    IScheduleBlockRepository ScheduleBlockRepository { get; }

    IScheduleRequestRepository ScheduleRequestRepository { get; }

    IOutcomeDocRequestRepository OutcomeDocRequestRepository { get; }

    IOutcomeDocRequestItemRepository OutcomeDocRequestItemRepository { get; }

    IDisputeFlagRepository DisputeFlagRepository { get; }

    ISubmissionReceiptRepository SubmissionReceiptRepository { get; }

    ITrialRepository TrialRepository { get; }

    ITrialDisputeRepository TrialDisputeRepository { get; }

    ITrialParticipantRepository TrialParticipantRepository { get; }

    ITrialInterventionRepository TrialInterventionRepository { get; }

    ITrialOutcomeRepository TrialOutcomeRepository { get; }

    ICustomConfigObjectRepository CustomConfigObjectRepository { get; }

    Task<int> Complete(bool withNoTracking = false);

    IDbContextTransaction BeginTransaction();
}