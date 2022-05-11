using CM.Data.Model;
using CM.Data.Repositories.Amendment;
using CM.Data.Repositories.AuditLogs;
using CM.Data.Repositories.AutoText;
using CM.Data.Repositories.Claim;
using CM.Data.Repositories.CmsArchive;
using CM.Data.Repositories.ConferenceBridge;
using CM.Data.Repositories.Dispute;
using CM.Data.Repositories.DisputeHearing;
using CM.Data.Repositories.EmailAttachment;
using CM.Data.Repositories.EmailMessage;
using CM.Data.Repositories.EmailTemplate;
using CM.Data.Repositories.FilePackageService;
using CM.Data.Repositories.Files;
using CM.Data.Repositories.Hearings;
using CM.Data.Repositories.IntakeQuestions;
using CM.Data.Repositories.InternalUserProfile;
using CM.Data.Repositories.InternalUserRole;
using CM.Data.Repositories.Maintenance;
using CM.Data.Repositories.Notes;
using CM.Data.Repositories.Notice;
using CM.Data.Repositories.OutcomeDocument;
using CM.Data.Repositories.Parties;
using CM.Data.Repositories.Payment;
using CM.Data.Repositories.Remedy;
using CM.Data.Repositories.Role;
using CM.Data.Repositories.Search;
using CM.Data.Repositories.Task;
using CM.Data.Repositories.Token;
using CM.Data.Repositories.UnitOfWork;
using CM.Data.Repositories.User;
using CM.Services.ReconciliationReportGenerator.ReconciliationReportGeneratorService.IntegrationEvents.EventHandling;
using CM.UserResolverService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CM.Services.ReconciliationReportGenerator.ReconciliationReportGeneratorService;

public static class CustomExtensionMethods
{
    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddTransient<IUnitOfWork, UnitOfWork>();
        services.AddTransient<IDisputeRepository, DisputeRepository>();
        services.AddTransient<ITokenRepository, TokenRepository>();
        services.AddTransient<IDisputeUserRepository, DisputeUserRepository>();
        services.AddTransient<ISystemUserRepository, SystemUserRepository>();
        services.AddTransient<IRoleRepository, RoleRepository>();
        services.AddTransient<IIntakeQuestionsRepository, IntakeQuestionsRepository>();
        services.AddTransient<IAuditLogRepository, AuditLogRepository>();
        services.AddTransient<IParticipantRepository, ParticipantRepository>();
        services.AddTransient<IClaimGroupRepository, ClaimGroupRepository>();
        services.AddTransient<IClaimGroupParticipantRepository, ClaimGroupParticipantRepository>();
        services.AddTransient<IClaimRepository, ClaimRepository>();
        services.AddTransient<IClaimDetailRepository, ClaimDetailRepository>();
        services.AddTransient<IRemedyRepository, RemedyRepository>();
        services.AddTransient<IRemedyDetailRepository, RemedyDetailRepository>();
        services.AddTransient<IEmailMessageRepository, EmailMessageRepository>();
        services.AddTransient<IEmailAttachmentRepository, EmailAttachmentRepository>();
        services.AddTransient<IEmailTemplateRepository, EmailTemplateRepository>();
        services.AddTransient<IHearingParticipationRepository, HearingParticipationRepository>();
        services.AddTransient<IDisputeFeeRepository, DisputeFeeRepository>();
        services.AddTransient<IPaymentTransactionRepository, PaymentTransactionRepository>();
        services.AddTransient<ISearchRepository, SearchRepository>();
        services.AddTransient<ILinkedFileRepository, LinkedFileRepository>();
        services.AddTransient<ICommonFileRepository, CommonFileRepository>();
        services.AddTransient<IFileDescriptionRepository, FileDescriptionRepository>();
        services.AddTransient<INoticeRepository, NoticeRepository>();
        services.AddTransient<INoticeServiceRepository, NoticeServiceRepository>();
        services.AddTransient<IInternalUserRoleRepository, InternalUserRoleRepository>();
        services.AddTransient<IInternalUserProfileRepository, InternalUserProfileRepository>();
        services.AddTransient<IAmendmentRepository, AmendmentRepository>();
        services.AddTransient<INoteRepository, NoteRepository>();
        services.AddTransient<ITaskRepository, TaskRepository>();
        services.AddTransient<IMaintenanceRepository, MaintenanceRepository>();
        services.AddTransient<IFilePackageRepository, FilePackageRepository>();
        services.AddTransient<IFilePackageServiceRepository, FilePackageServiceRepository>();
        services.AddTransient<IOutcomeDocGroupRepository, OutcomeDocGroupRepository>();
        services.AddTransient<IOutcomeDocFileRepository, OutcomeDocFileRepository>();
        services.AddTransient<IOutcomeDocContentRepository, OutcomeDocContentRepository>();
        services.AddTransient<IOutcomeDocDeliveryRepository, OutcomeDocDeliveryRepository>();
        services.AddTransient<IAutoTextRepository, AutoTextRepository>();
        services.AddTransient<IDataModelRepository, DataModelRepository>();
        services.AddTransient<ICmsParticipantRepository, CmsParticipantRepository>();
        services.AddTransient<ICmsArchiveNoteRepository, CmsArchiveNoteRepository>();
        services.AddTransient<ICmsFileRepository, CmsFileRepository>();
        services.AddTransient<ICmsCorrectionRepository, CmsCorrectionRepository>();
        services.AddTransient<IConferenceBridgeRepository, ConferenceBridgeRepository>();
        services.AddTransient<IDisputeHearingRepository, DisputeHearingRepository>();
        services.AddTransient<IHearingRepository, HearingRepository>();

        return services;
    }

    public static IServiceCollection AddCustomDbContext(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DbConnection");
        services.AddEntityFrameworkNpgsql()
            .AddDbContext<CaseManagementContext>(c => c.UseNpgsql(connectionString, b => b.MigrationsAssembly("CM.Data.Model")), ServiceLifetime.Transient);

        return services;
    }

    public static IServiceCollection AddCustomIntegrations(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        services.AddSingleton<IUserResolver, UserResolver>();

        services.AddTransient<ReconciliationReportGenerationEventHandler, ReconciliationReportGenerationEventHandler>();

        return services;
    }
}