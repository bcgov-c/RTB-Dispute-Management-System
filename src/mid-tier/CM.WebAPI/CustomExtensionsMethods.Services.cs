using CM.Business.Services.AbandonedDisputesNotification;
using CM.Business.Services.AccessCode;
using CM.Business.Services.AdHocFileCleanup;
using CM.Business.Services.Amendment;
using CM.Business.Services.AricApplicantEvidenceReminder;
using CM.Business.Services.ArsReminder;
using CM.Business.Services.AuditLogs;
using CM.Business.Services.AutoText;
using CM.Business.Services.BulkEmailRecipient;
using CM.Business.Services.CanadaPost;
using CM.Business.Services.ClaimDetails;
using CM.Business.Services.Claims;
using CM.Business.Services.CmsArchive;
using CM.Business.Services.ColdStorage;
using CM.Business.Services.ConferenceBridge;
using CM.Business.Services.CronJobHistory;
using CM.Business.Services.CustomConfigObject;
using CM.Business.Services.CustomDataObject;
using CM.Business.Services.Dashboard;
using CM.Business.Services.DataWarehouseScheduling;
using CM.Business.Services.DisputeAbandonedForNoPayment;
using CM.Business.Services.DisputeAbandonedForNoService;
using CM.Business.Services.DisputeAccess;
using CM.Business.Services.DisputeFlag;
using CM.Business.Services.DisputeHearing;
using CM.Business.Services.DisputeProcessDetail;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.DisputeVerification;
using CM.Business.Services.EmailAttachment;
using CM.Business.Services.EmailMessages;
using CM.Business.Services.EmailTemplate;
using CM.Business.Services.ExternalCustomDataObject;
using CM.Business.Services.ExternalErrorLog;
using CM.Business.Services.ExternalFileService;
using CM.Business.Services.FactHearingSummaryScheduling;
using CM.Business.Services.FactIntakeProcessingScheduling;
using CM.Business.Services.FactIssueOutcomeScheduling;
using CM.Business.Services.FactResolutionServiceScheduling;
using CM.Business.Services.FactTimeStatisticScheduling;
using CM.Business.Services.FilePackageService;
using CM.Business.Services.Files;
using CM.Business.Services.HearingRecordingTransfer;
using CM.Business.Services.HearingReporting;
using CM.Business.Services.Hearings;
using CM.Business.Services.IntakeQuestions;
using CM.Business.Services.InternalUserProfile;
using CM.Business.Services.InternalUserRole;
using CM.Business.Services.Maintenance;
using CM.Business.Services.ManualHearingVerification;
using CM.Business.Services.Notes;
using CM.Business.Services.Notice;
using CM.Business.Services.NoticeService;
using CM.Business.Services.OfficeUser;
using CM.Business.Services.OnlineMeeting;
using CM.Business.Services.OutcomeDocRequest;
using CM.Business.Services.OutcomeDocument;
using CM.Business.Services.ParticipantIdentityService;
using CM.Business.Services.Parties;
using CM.Business.Services.Payment;
using CM.Business.Services.PfrApplicantEvidenceReminder;
using CM.Business.Services.Poll;
using CM.Business.Services.Reconciliation;
using CM.Business.Services.RemedyDetails;
using CM.Business.Services.RemedyServices;
using CM.Business.Services.RoleService;
using CM.Business.Services.ScheduleBlock;
using CM.Business.Services.ScheduledHearingReminder;
using CM.Business.Services.SchedulePeriod;
using CM.Business.Services.ScheduleRequest;
using CM.Business.Services.Scheduling;
using CM.Business.Services.Search;
using CM.Business.Services.ServiceAuditLog;
using CM.Business.Services.SiteVersion;
using CM.Business.Services.SubmissionReceipt;
using CM.Business.Services.SubstitutedService;
using CM.Business.Services.SystemSettingsService;
using CM.Business.Services.Task;
using CM.Business.Services.TokenServices;
using CM.Business.Services.Trial;
using CM.Business.Services.TrialDispute;
using CM.Business.Services.TrialIntervention;
using CM.Business.Services.TrialOutcome;
using CM.Business.Services.TrialParticipant;
using CM.Business.Services.UserServices;
using CM.Business.Services.WorkflowReports;
using CM.UserResolverService;
using CM.WebAPI.WebApiHelpers.CustomHealthChecks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace CM.WebAPI;

public static partial class CustomExtensionsMethods
{
    public static IServiceCollection AddCustomIntegrations(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        services.AddSingleton<IUserResolver, UserResolver>();

        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IAuthenticateService, AuthenticateService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IRoleService, RoleService>();
        services.AddScoped<IDisputeService, DisputeService>();
        services.AddScoped<IDisputeProcessDetailService, DisputeProcessDetailService>();
        services.AddScoped<IIntakeQuestionsService, IntakeQuestionsService>();
        services.AddScoped<IAuditLogService, AuditLogService>();
        services.AddScoped<IClaimGroupService, ClaimGroupService>();
        services.AddScoped<IParticipantService, ParticipantService>();
        services.AddScoped<IClaimGroupParticipantService, ClaimGroupParticipantService>();
        services.AddScoped<IClaimService, ClaimService>();
        services.AddScoped<IClaimDetailService, ClaimDetailService>();
        services.AddScoped<IRemedyService, RemedyService>();
        services.AddScoped<IRemedyDetailService, RemedyDetailService>();
        services.AddScoped<IEmailMessageService, EmailMessageService>();
        services.AddScoped<IEmailAttachmentService, EmailAttachmentService>();
        services.AddScoped<IEmailTemplateService, EmailTemplateService>();
        services.AddScoped<IHearingParticipationService, HearingParticipationService>();
        services.AddScoped<IDisputeFeeService, DisputeFeeService>();
        services.AddScoped<IPaymentTransactionService, PaymentTransactionService>();
        services.AddScoped<ISystemSettingsService, SystemSettingsService>();
        services.AddScoped<ISearchService, SearchService>();
        services.AddScoped<IFileService, FileService>();
        services.AddScoped<ILinkedFileService, LinkedFileService>();
        services.AddScoped<ICommonFileService, CommonFileService>();
        services.AddScoped<IFileDescriptionService, FileDescriptionService>();
        services.AddScoped<INoticeService, NoticeService>();
        services.AddScoped<INoticeServiceService, NoticeServiceService>();
        services.AddScoped<IInternalUserRoleService, InternalUserRoleService>();
        services.AddScoped<IInternalUserProfileService, InternalUserProfileService>();
        services.AddScoped<IAmendmentService, AmendmentService>();
        services.AddScoped<IAccessCodeService, AccessCodeService>();
        services.AddScoped<INoteService, NoteService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<ITaskService, TaskService>();
        services.AddScoped<IMaintenanceService, MaintenanceService>();
        services.AddScoped<IFilePackageService, FilePackageService>();
        services.AddScoped<IFilePackageServiceService, FilePackageServiceService>();
        services.AddScoped<IOutcomeDocGroupService, OutcomeDocGroupService>();
        services.AddScoped<IOutcomeDocFileService, OutcomeDocFileService>();
        services.AddScoped<IOutcomeDocContentService, OutcomeDocContentService>();
        services.AddScoped<IOutcomeDocDeliveryService, OutcomeDocDeliveryService>();
        services.AddScoped<IAutoTextService, AutoTextService>();
        services.AddScoped<ICmsArchiveService, CmsArchiveService>();
        services.AddScoped<IConferenceBridgeService, ConferenceBridgeService>();
        services.AddScoped<IDisputeHearingService, DisputeHearingService>();
        services.AddScoped<IHearingService, HearingService>();
        services.AddScoped<IHearingImportService, HearingImportService>();
        services.AddScoped<IHearingReportingService, HearingReportingService>();
        services.AddScoped<ISiteVersionService, SiteVersionService>();
        services.AddScoped<IOfficeUserService, OfficeUserService>();
        services.AddScoped<IDisputeAccessService, DisputeAccessService>();
        services.AddScoped<ISubstitutedService, SubstitutedService>();
        services.AddScoped<IWorkflowReportsService, WorkflowReportsService>();
        services.AddScoped<IBulkEmailRecipientService, BulkEmailRecipientService>();
        services.AddScoped<IHearingAuditLogService, HearingAuditLogService>();
        services.AddScoped<IOutcomeDocRequestService, OutcomeDocRequestService>();
        services.AddScoped<IOutcomeDocRequestItemService, OutcomeDocRequestItemService>();
        services.AddScoped<IDisputeFlagService, DisputeFlagService>();
        services.AddScoped<ICustomDataObjectService, CustomDataObjectService>();
        services.AddScoped<IExternalCustomDataObjectService, ExternalCustomDataObjectService>();
        services.AddScoped<IExternalFileService, ExternalFileService>();
        services.AddScoped<IServiceAuditLogService, ServiceAuditLogService>();
        services.AddScoped<ICanadaPostService, CanadaPostService>();

        services.AddScoped<ISchedulingService, SchedulingService>();
        services.AddScoped<IDisputeAbandonedDueToApplicantInactionService, DisputeAbandonedDueToApplicantInactionService>();
        services.AddScoped<IDisputeAbandonedForNoPaymentService, DisputeAbandonedForNoPaymentService>();
        services.AddScoped<IDisputeAbandonedDueToApplicantServiceInactionService, DisputeAbandonedDueToApplicantServiceInactionService>();
        services.AddScoped<IScheduledReminderService, ScheduledReminderService>();
        services.AddScoped<IPaymentConfirmationService, PaymentConfirmationService>();
        services.AddScoped<IReconciliationService, ReconciliationService>();
        services.AddScoped<IDataWarehouseSchedulingService, DataWarehouseSchedulingService>();
        services.AddScoped<IFactHearingSummarySchedulingService, FactHearingSummarySchedulingService>();
        services.AddScoped<IFactTimeStatisticSchedulingService, FactTimeStatisticSchedulingService>();
        services.AddScoped<IFactIntakeProcessingSchedulingService, FactIntakeProcessingSchedulingService>();
        services.AddScoped<IFactResolutionServiceSchedulingService, FactResolutionServiceSchedulingService>();
        services.AddScoped<IFactIssueOutcomeSchedulingService, FactIssueOutcomeSchedulingService>();
        services.AddScoped<IHearingReportingService, HearingReportingService>();
        services.AddScoped<IColdStorageMigrationService, ColdStorageMigrationMigrationService>();
        services.AddScoped<ISchedulePeriodService, SchedulePeriodService>();
        services.AddScoped<IScheduleBlockService, ScheduleBlockService>();
        services.AddScoped<IScheduleRequestService, ScheduleRequestService>();
        services.AddScoped<IOutcomeDocRequestService, OutcomeDocRequestService>();
        services.AddScoped<IOutcomeDocRequestItemService, OutcomeDocRequestItemService>();
        services.AddScoped<IDisputeFlagService, DisputeFlagService>();
        services.AddScoped<ISubmissionReceiptService, SubmissionReceiptService>();
        services.AddScoped<ITrialService, TrialService>();
        services.AddScoped<ITrialDisputeService, TrialDisputeService>();
        services.AddScoped<ITrialParticipantService, TrialParticipantService>();
        services.AddScoped<ITrialInterventionService, TrialInterventionService>();
        services.AddScoped<ITrialOutcomeService, TrialOutcomeService>();
        services.AddScoped<ICustomConfigObjectService, CustomConfigObjectService>();
        services.AddScoped<ISendPreferredDateEmailsService, SendPreferredDateEmailsService>();
        services.AddScoped<IRetryErrorSendEmailsService, RetryErrorSendEmailsService>();
        services.AddScoped<ICronJobHistoryService, CronJobHistoryService>();
        services.AddScoped<IExternalErrorLogService, ExternalErrorLogService>();
        services.AddScoped<IPollService, PollService>();
        services.AddScoped<IPollResponseService, PollResponseService>();
        services.AddScoped<IParticipantIdentityService, ParticipantIdentityService>();
        services.AddScoped<IOnlineMeetingService, OnlineMeetingService>();
        services.AddScoped<IDisputeVerificationService, DisputeVerificationService>();

        services.AddScoped<IManualHearingVerificationService, ManualHearingVerificationService>();

        services.AddScoped<IAricApplicantEvidenceReminderService, AricApplicantEvidenceReminderService>();
        services.AddScoped<IPfrParticipatoryApplicantEvidenceReminderService, PfrParticipatoryApplicantEvidenceReminderService>();

        services.AddScoped<IHearingRecordingTransferService, HearingRecordingTransferService>();
        services.AddScoped<IScheduledAdHocFileCleanupService, ScheduledAdHocFileCleanupService>();

        services.AddScoped<IArsReminderService, ArsReminderService>();

        services.AddSingleton<IHealthCheck, ThumbnailHealthCheck>();
        services.AddSingleton<IHealthCheck, FileStorageHealthCheck>();
        services.AddSingleton<IHealthCheck, FfmpegHealthCheck>();

        return services;
    }
}