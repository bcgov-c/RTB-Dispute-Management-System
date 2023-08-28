using System;
using CM.Services.AdHocReportSender.AdHocReportSenderService.ExternalContexts;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Job;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Repositories.AdHocDlReport;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Repositories.AdHocReport;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Repositories.AdHocReportAttachment;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Repositories.UnitOfWork;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Services;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Services.AdHocDlReport;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Services.AdHocReport;
using CM.UserResolverService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService;

public static class CustomExtensionMethods
{
    public static IServiceCollection AddMapper(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
        return services;
    }

    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IAdHocDlReportRepository, AdHocDlReportRepository>();
        services.AddScoped<IAdHocReportRepository, AdHocReportRepository>();
        services.AddScoped<IAdHocReportAttachmentRepository, AdHocReportAttachmentRepository>();
        return services;
    }

    public static IServiceCollection AddScheduler(this IServiceCollection services, IConfiguration configuration)
    {
        var jobs = new[]
        {
            typeof(AdHocReportJob)
        };

        services.UseQuartz(jobs);

        return services;
    }

    public static IServiceCollection AddCustomDbContext(this IServiceCollection services, IConfiguration configuration)
    {
        var adHocReportConnectionConnectionString = configuration.GetConnectionString("AdHocReportConnection");
        services
            .AddEntityFrameworkNpgsql()
            .AddDbContext<AdHocReportContext>(c => c.UseNpgsql(adHocReportConnectionConnectionString), ServiceLifetime.Transient);

        var rtbDmsConnectionString = configuration.GetConnectionString("DbConnection");
        services
            .AddEntityFrameworkNpgsql()
            .AddDbContext<RtbDmsContext>(c => c.UseNpgsql(rtbDmsConnectionString), ServiceLifetime.Transient);

        var pdConnectionString = configuration.GetConnectionString("PdConnection");
        services
            .AddEntityFrameworkNpgsql()
            .AddDbContext<PostedDecisionContext>(c => c.UseNpgsql(pdConnectionString), ServiceLifetime.Transient);

        var dwConnectionString = configuration.GetConnectionString("DwConnection");
        services
            .AddEntityFrameworkNpgsql()
            .AddDbContext<DataWarehouseContext>(c => c.UseNpgsql(dwConnectionString), ServiceLifetime.Transient);

        return services;
    }

    public static IServiceCollection AddCustomIntegrations(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        services.AddSingleton<IUserResolver, UserResolver>();
        services.AddScoped<IScheduledAdHocReport, ScheduledAdHocReport>();
        services.AddScoped<IAdHocDlReportService, AdHocDlReportService>();
        services.AddScoped<IAdHocReportService, AdHocReportService>();

        return services;
    }
}