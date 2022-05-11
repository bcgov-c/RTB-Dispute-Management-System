using System;
using System.Collections.Generic;
using CM.Business.Services.AbandonedDisputesNotification;
using CM.Business.Services.AccessCode;
using CM.Business.Services.Amendment;
using CM.Business.Services.AricApplicantEvidenceReminder;
using CM.Business.Services.AuditLogs;
using CM.Business.Services.AutoText;
using CM.Business.Services.BulkEmailRecipient;
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
using CM.Business.Services.EmailAttachment;
using CM.Business.Services.EmailMessages;
using CM.Business.Services.EmailTemplate;
using CM.Business.Services.ExternalCustomDataObject;
using CM.Business.Services.ExternalFileService;
using CM.Business.Services.FactHearingSummaryScheduling;
using CM.Business.Services.FactIntakeProcessingScheduling;
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
using CM.Business.Services.Mapping;
using CM.Business.Services.Notes;
using CM.Business.Services.Notice;
using CM.Business.Services.NoticeService;
using CM.Business.Services.OfficeUser;
using CM.Business.Services.OutcomeDocRequest;
using CM.Business.Services.OutcomeDocument;
using CM.Business.Services.Parties;
using CM.Business.Services.Payment;
using CM.Business.Services.PfrApplicantEvidenceReminder;
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
using CM.Common.Utilities;
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
using CM.Data.Repositories.EmailAttachment;
using CM.Data.Repositories.EmailMessage;
using CM.Data.Repositories.EmailTemplate;
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
using CM.Data.Repositories.Task;
using CM.Data.Repositories.Token;
using CM.Data.Repositories.Trial;
using CM.Data.Repositories.TrialDispute;
using CM.Data.Repositories.TrialIntervention;
using CM.Data.Repositories.TrialOutcome;
using CM.Data.Repositories.TrialParticipant;
using CM.Data.Repositories.UnitOfWork;
using CM.Data.Repositories.User;
using CM.Data.Repositories.WorkflowReports;
using CM.Scheduler.Task.Infrastructure;
using CM.Scheduler.Task.Jobs;
using CM.ServiceBase;
using CM.UserResolverService;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers.CustomHealthChecks;
using EasyNetQ.ConnectionString;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.OpenApi.Models;
using RabbitMQ.Client;

namespace CM.WebAPI;

public static class CustomExtensionsMethods
{
    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IDisputeRepository, DisputeRepository>();
        services.AddScoped<IDisputeProcessDetailRepository, DisputeProcessDetailRepository>();
        services.AddScoped<ITokenRepository, TokenRepository>();
        services.AddScoped<IDisputeUserRepository, DisputeUserRepository>();
        services.AddScoped<ISystemUserRepository, SystemUserRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IIntakeQuestionsRepository, IntakeQuestionsRepository>();
        services.AddScoped<IAuditLogRepository, AuditLogRepository>();
        services.AddScoped<IParticipantRepository, ParticipantRepository>();
        services.AddScoped<IClaimGroupRepository, ClaimGroupRepository>();
        services.AddScoped<IClaimGroupParticipantRepository, ClaimGroupParticipantRepository>();
        services.AddScoped<IClaimRepository, ClaimRepository>();
        services.AddScoped<IClaimDetailRepository, ClaimDetailRepository>();
        services.AddScoped<IRemedyRepository, RemedyRepository>();
        services.AddScoped<IRemedyDetailRepository, RemedyDetailRepository>();
        services.AddScoped<IEmailMessageRepository, EmailMessageRepository>();
        services.AddScoped<IEmailAttachmentRepository, EmailAttachmentRepository>();
        services.AddScoped<IEmailTemplateRepository, EmailTemplateRepository>();
        services.AddScoped<IHearingParticipationRepository, HearingParticipationRepository>();
        services.AddScoped<IDisputeFeeRepository, DisputeFeeRepository>();
        services.AddScoped<IPaymentTransactionRepository, PaymentTransactionRepository>();
        services.AddScoped<ISearchRepository, SearchRepository>();
        services.AddScoped<ILinkedFileRepository, LinkedFileRepository>();
        services.AddScoped<ICommonFileRepository, CommonFileRepository>();
        services.AddScoped<IFileDescriptionRepository, FileDescriptionRepository>();
        services.AddScoped<INoticeRepository, NoticeRepository>();
        services.AddScoped<INoticeServiceRepository, NoticeServiceRepository>();
        services.AddScoped<IInternalUserRoleRepository, InternalUserRoleRepository>();
        services.AddScoped<IInternalUserProfileRepository, InternalUserProfileRepository>();
        services.AddScoped<IAmendmentRepository, AmendmentRepository>();
        services.AddScoped<INoteRepository, NoteRepository>();
        services.AddScoped<ITaskRepository, TaskRepository>();
        services.AddScoped<IMaintenanceRepository, MaintenanceRepository>();
        services.AddScoped<IFilePackageRepository, FilePackageRepository>();
        services.AddScoped<IFilePackageServiceRepository, FilePackageServiceRepository>();
        services.AddScoped<IOutcomeDocGroupRepository, OutcomeDocGroupRepository>();
        services.AddScoped<IOutcomeDocFileRepository, OutcomeDocFileRepository>();
        services.AddScoped<IOutcomeDocContentRepository, OutcomeDocContentRepository>();
        services.AddScoped<IOutcomeDocDeliveryRepository, OutcomeDocDeliveryRepository>();
        services.AddScoped<IAutoTextRepository, AutoTextRepository>();
        services.AddScoped<IDataModelRepository, DataModelRepository>();
        services.AddScoped<ICmsParticipantRepository, CmsParticipantRepository>();
        services.AddScoped<ICmsArchiveNoteRepository, CmsArchiveNoteRepository>();
        services.AddScoped<ICmsFileRepository, CmsFileRepository>();
        services.AddScoped<ICmsCorrectionRepository, CmsCorrectionRepository>();
        services.AddScoped<IConferenceBridgeRepository, ConferenceBridgeRepository>();
        services.AddScoped<IDisputeHearingRepository, DisputeHearingRepository>();
        services.AddScoped<IHearingRepository, HearingRepository>();
        services.AddScoped<IImportHearingRepository, ImportHearingRepository>();
        services.AddScoped<ISiteVersionRepository, SiteVersionRepository>();
        services.AddScoped<ISubstitutedServiceRepository, SubstitutedServiceRepository>();
        services.AddScoped<IWorkflowReportsRepository, WorkflowReportsRepository>();
        services.AddScoped<IBulkEmailRecipientRepository, BulkEmailRecipientRepository>();
        services.AddScoped<IHearingAuditLogRepository, HearingAuditLogRepository>();
        services.AddScoped<ICustomDataObjectRepository, CustomDataObjectRepository>();
        services.AddScoped<ISchedulePeriodRepository, SchedulePeriodRepository>();
        services.AddScoped<IScheduleBlockRepository, ScheduleBlockRepository>();
        services.AddScoped<IScheduleRequestRepository, ScheduleRequestRepository>();
        services.AddScoped<IOutcomeDocRequestRepository, OutcomeDocRequestRepository>();
        services.AddScoped<IOutcomeDocRequestItemRepository, OutcomeDocRequestItemRepository>();
        services.AddScoped<IDisputeFlagRepository, DisputeFlagRepository>();
        services.AddScoped<ISubmissionReceiptRepository, SubmissionReceiptRepository>();
        services.AddScoped<ITrialRepository, TrialRepository>();
        services.AddScoped<ITrialDisputeRepository, TrialDisputeRepository>();
        services.AddScoped<ITrialParticipantRepository, TrialParticipantRepository>();
        services.AddScoped<ITrialInterventionRepository, TrialInterventionRepository>();
        services.AddScoped<ITrialOutcomeRepository, TrialOutcomeRepository>();
        services.AddScoped<ICustomConfigObjectRepository, CustomConfigObjectRepository>();
        services.AddScoped<IExternalCustomDataObjectRepository, ExternalCustomDataObjectRepository>();
        services.AddScoped<IExternalFileRepository, ExternalFileRepository>();

        return services;
    }

    public static IServiceCollection AddMapper(this IServiceCollection services, IConfiguration configuration)
    {
        if (configuration.IsTesting() == false)
        {
            services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
        }
        else
        {
            services.AddSingleton(MappingProfile.Init());
        }

        return services;
    }

    public static IServiceCollection AddCustomDbContext(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DbConnection");
        services.AddEntityFrameworkNpgsql()
            .AddDbContext<CaseManagementContext>(
                options => options
                    .UseNpgsql(connectionString, b => b.MigrationsAssembly("CM.Data.Model")));

        return services;
    }

    public static IServiceCollection AddCustomSwagger(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo());
            c.SchemaFilter<SwaggerExcludeFilter>();

            c.AddSecurityDefinition("Token", new OpenApiSecurityScheme
            {
                Description = "Enter your token in the text input below.\r\n\r\nExample: \"MyToken\"",
                Name = "Token",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Token"
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Token"
                        },
                        Scheme = "custom",
                        Name = "Token",
                        In = ParameterLocation.Header
                    },
                    new List<string>()
                }
            });
        });

        services.ConfigureSwaggerGen(options =>
        {
            options.OperationFilter<DisputeGuidHeaderParameterOperationFilter>();
            options.OperationFilter<ConcurrencyCheckHeaderParameter>();
            options.OperationFilter<FileOperationFilter>();
        });

        services.AddSwaggerGenNewtonsoftSupport();
        return services;
    }

    public static IServiceCollection AddCustomCors(this IServiceCollection services, IConfiguration configuration)
    {
        var origins = configuration.GetSection("Cors:AllowedOriginList");

        services.AddCors(
            options => options.AddPolicy(
                "AllowCors",
                builder =>
                {
                    builder
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .WithExposedHeaders(ApiHeader.Token, "Content-Type", ApiHeader.Authorization);

                    if (origins.Exists())
                    {
                        builder.WithOrigins(origins.Get<string[]>());
                    }
                    else
                    {
                        builder.AllowAnyOrigin();
                    }
                }));

        return services;
    }

    public static IServiceCollection AddAntiForgery(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAntiforgery(options =>
        {
            options.HeaderName = ApiHeader.XCsrfToken;
        });

        return services;
    }

    public static IServiceCollection AddScheduler(this IServiceCollection services, IConfiguration configuration)
    {
        var jobs = new[]
        {
            typeof(ParticipatoryHearingReminderJob),
            typeof(ParticipatoryApplicantEvidenceReminderJob),
            typeof(ParticipatoryRespondentEvidenceReminderJob),
            typeof(ParticipatoryEmergRespondentEvidenceReminderPeriodJob),
            typeof(ReconciliationReportJob),
            typeof(DisputeAbandonedDueToApplicantInactionJob),
            typeof(DisputeAbandonedForNoPaymentJob),
            typeof(FactDisputeSummaryJob),
            typeof(FactTimeStatisticsJob),
            typeof(FactIntakeProcessingJob),
            typeof(FactHearingSummaryJob),
            typeof(DisputeAbandonedForNoServiceJob),
            typeof(ColdStorageScheduleJob),
            typeof(AricParticipatoryApplicantEvidenceReminderJob),
            typeof(PfrParticipatoryApplicantEvidenceReminderJob),
            typeof(HearingRecordingTransferJob)
        };

        services.UseQuartz(jobs);

        return services;
    }

    public static IServiceCollection AddHealthChecks(this IServiceCollection services, IConfiguration configuration)
    {
        var hcBuilder = services
            .AddHealthChecks();

        if (configuration.GetSection("HealthServices").Exists())
        {
            var connectionParser = new ConnectionStringParser();
            var amqpConnectionString = connectionParser.GetAmqpString(configuration["MQ:Cluster"]);
            var factory = new ConnectionFactory
            {
                Uri = new Uri(amqpConnectionString),
                AutomaticRecoveryEnabled = true
            };

            var connection = factory.CreateConnection();

            hcBuilder
                .AddNpgSql(configuration.GetConnectionString("DbConnection"))
                .AddRabbitMQ(_ => connection)
                .AddWorkingSetHealthCheck(HealthCheckConfiguration.MaxMemory)
                .AddPrivateMemoryHealthCheck(HealthCheckConfiguration.MaxMemory)
                .AddCheck<ThumbnailHealthCheck>("Thumbnail")
                .AddCheck<FfmpegHealthCheck>("Ffmpeg")
                .AddCheck<FileStorageHealthCheck>("FileStorage")
                .AddUrlGroup(configuration.GetServiceHealth(ServiceNames.ReconciliationReportGenerator), ServiceNames.ReconciliationReportGenerator)
                .AddUrlGroup(configuration.GetServiceHealth(ServiceNames.ReconciliationReportSender), ServiceNames.ReconciliationReportSender)
                .AddUrlGroup(configuration.GetServiceHealth(ServiceNames.Pdf), ServiceNames.Pdf)
                .AddUrlGroup(configuration.GetServiceHealth(ServiceNames.AdHocReport), ServiceNames.AdHocReport)
                .AddUrlGroup(configuration.GetServiceHealth(ServiceNames.EmailGenerator), ServiceNames.EmailGenerator)
                .AddUrlGroup(configuration.GetServiceHealth(ServiceNames.EmailNotification), ServiceNames.EmailNotification)
                .AddUrlGroup(configuration.GetServiceHealth(ServiceNames.PostedDecision), ServiceNames.PostedDecision)
                .AddUrlGroup(configuration.GetServiceHealth(ServiceNames.PostedDecisionDataCollection), ServiceNames.PostedDecisionDataCollection)
                .AddUrlGroup(configuration.GetServiceHealth(ServiceNames.DataWarehouseService), ServiceNames.DataWarehouseService)
                .AddUrlGroup(configuration.GetServiceHealth(ServiceNames.DataWarehouseReport), ServiceNames.DataWarehouseReport);

            services
                .AddHealthChecksUI(options =>
                {
                    options.AddHealthCheckEndpoint(
                        "Case Management Monitoring Dashboard",
                        configuration.GetServiceHealth(ServiceNames.MidTier).AbsoluteUri);
                })
                .AddInMemoryStorage();
        }

        return services;
    }

    public static IServiceCollection AddCustomInitializers(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<FormOptions>(o =>
        {
            o.ValueLengthLimit = int.MaxValue;
            o.MultipartBodyLengthLimit = int.MaxValue;
            o.MemoryBufferThreshold = int.MaxValue;
        });

        return services;
    }

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
        services.AddScoped<INoticeService, Business.Services.Notice.NoticeService>();
        services.AddScoped<INoticeServiceService, NoticeServiceService>();
        services.AddScoped<IInternalUserRoleService, InternalUserRoleService>();
        services.AddScoped<IInternalUserProfileService, InternalUserProfileService>();
        services.AddScoped<IAmendmentService, AmendmentService>();
        services.AddScoped<IAccessCodeService, AccessCodeService>();
        services.AddScoped<INoteService, NoteService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<ITaskService, TaskService>();
        services.AddScoped<IMaintenanceService, MaintenanceService>();
        services.AddScoped<IFilePackageService, Business.Services.Files.FilePackageService>();
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
        services.AddScoped<ISubstitutedService, Business.Services.SubstitutedService.SubstitutedService>();
        services.AddScoped<IWorkflowReportsService, WorkflowReportsService>();
        services.AddScoped<IBulkEmailRecipientService, BulkEmailRecipientService>();
        services.AddScoped<IHearingAuditLogService, HearingAuditLogService>();
        services.AddScoped<IOutcomeDocRequestService, OutcomeDocRequestService>();
        services.AddScoped<IOutcomeDocRequestItemService, OutcomeDocRequestItemService>();
        services.AddScoped<IDisputeFlagService, DisputeFlagService>();
        services.AddScoped<ICustomDataObjectService, CustomDataObjectService>();
        services.AddScoped<IExternalCustomDataObjectService, ExternalCustomDataObjectService>();
        services.AddScoped<IExternalFileService, ExternalFileService>();

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

        services.AddScoped<ICronJobHistoryService, CronJobHistoryService>();

        services.AddScoped<IAricApplicantEvidenceReminderService, AricApplicantEvidenceReminderService>();
        services.AddScoped<IPfrParticipatoryApplicantEvidenceReminderService, PfrParticipatoryApplicantEvidenceReminderService>();

        services.AddScoped<IHearingRecordingTransferService, HearingRecordingTransferService>();

        services.AddSingleton<IHealthCheck, ThumbnailHealthCheck>();
        services.AddSingleton<IHealthCheck, FileStorageHealthCheck>();
        services.AddSingleton<IHealthCheck, FfmpegHealthCheck>();

        return services;
    }
}