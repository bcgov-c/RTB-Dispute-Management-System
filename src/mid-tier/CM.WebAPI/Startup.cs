using System;
using System.Net;
using CM.Common.ChunkedFileUpload;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Scheduler.Task.Infrastructure;
using CM.Scheduler.Task.Jobs;
using CM.ServiceBase;
using CM.Storage;
using CM.Storage.Config;
using CM.WebAPI.Configuration;
using CM.WebAPI.WebApiHelpers;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Quartz;
using Serilog;
using Swashbuckle.AspNetCore.SwaggerUI;

namespace CM.WebAPI;

public class Startup
{
    public Startup(IConfiguration configuration, IWebHostEnvironment hostingEnvironment)
    {
        Configuration = configuration;
        var builder = hostingEnvironment.GetConfigurationBuilder();
        Configuration = builder.Build();
    }

    private IConfiguration Configuration { get; }

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddOptions();
        services.Configure<StorageSettings>(Configuration.GetSection("StorageSettings"));

        var serviceList = Configuration.GetSection("Services");
        services.Configure<ServiceList>(serviceList);

        var jwtSettings = Configuration.GetSection("ExternalJwtSettings");
        if (jwtSettings.Exists() == false)
        {
            throw new ArgumentException("ExternalJwtSettings section in appsettings is missing");
        }

        services.Configure<JwtSettings>(jwtSettings);

        var audioConversionSettings = Configuration.GetSection("AudioConversionSettings");
        services.Configure<AudioConversionSettings>(audioConversionSettings);

        services.AddControllersWithViews(options =>
            {
                options.ModelBinderProviders.Add(new UploadFileRequestBinderProvider());
            })
            .AddNewtonsoftJson();

        services
            .AddLogger(Configuration)
            .AddMapper(Configuration)
            .AddRepositories()
            .AddCustomIntegrations(Configuration)
            .AddCustomMvc()
            .AddCustomCors(Configuration)
            .AddAntiForgery(Configuration)
            .AddCustomDbContext(Configuration)
            .AddEventBus(Configuration)
            .AddCustomSwagger(Configuration)
            .AddScheduler(Configuration)
            .AddHealthChecks(Configuration)
            .AddCustomInitializers(Configuration)
            .AddStorage(Configuration);
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory)
    {
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

        app.UseStaticFiles();
        app.UseDefaultFiles();

        app.UseRouting();
        app.UseCors("AllowCors");

        loggerFactory.AddSerilog();

        app.UseDataBaseMigrations<CaseManagementContext>(Configuration);

        ConfigureScheduler(app);

        app.UseEnableRequestBuffering();
        app.UseErrorWrappingMiddleware();
        app.UseAuditLogging();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();

            if (Configuration.GetSection("HealthServices").Exists())
            {
                endpoints.MapHealthChecks("/check", new HealthCheckOptions
                {
                    Predicate = _ => true,
                    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
                });

                endpoints.MapHealthChecksUI(options =>
                {
                    options.UIPath = Configuration["HealthServices:health-ui"];
                    options.ApiPath = Configuration["HealthServices:health-ui-api"];
                    options.AddCustomStylesheet("dotnet.css");
                });
            }
        });

        UseForwardHeaders(app);

        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.DocExpansion(DocExpansion.None);
            c.SwaggerEndpoint("../swagger/v1/swagger.json", "Case Management V1");
        });
    }

    private void ConfigureScheduler(IApplicationBuilder app)
    {
        var scheduler = app.ApplicationServices.GetService<IScheduler>();

        scheduler.StartScheduledJob<ParticipatoryHearingReminderJob>(Configuration["Scheduler:HearingReminderCronSchedule"], "HearingReminderJob");
        scheduler.StartScheduledJob<ParticipatoryApplicantEvidenceReminderJob>(Configuration["Scheduler:ApplicantEvidenceReminderCronSchedule"], "ApplicantEvidenceReminderJob");
        scheduler.StartScheduledJob<ParticipatoryRespondentEvidenceReminderJob>(Configuration["Scheduler:RespondentEvidenceReminderCronSchedule"], "RespondentEvidenceReminderJob");
        scheduler.StartScheduledJob<ParticipatoryEmergRespondentEvidenceReminderPeriodJob>(Configuration["Scheduler:RespondentEmergEvidenceReminderCronSchedule"], "RespondentEmergEvidenceReminderJob");
        scheduler.StartScheduledJob<ReconciliationReportJob>(Configuration["Scheduler:ReconciliationReportCronSchedule"], "ReconciliationReportJob");
        scheduler.StartScheduledJob<DisputeAbandonedDueToApplicantInactionJob>(Configuration["Scheduler:AbandonedDisputesNotificationSchedule"], "AbandonedDisputesNotificationJob");
        scheduler.StartScheduledJob<DisputeAbandonedForNoPaymentJob>(Configuration["Scheduler:DisputeAbandonedForNoPaymentSchedule"], "DisputeAbandonedForNoPaymentJob");
        scheduler.StartScheduledJob<FactDisputeSummaryJob>(Configuration["Scheduler:FactDisputeSummarySchedule"], "FactDisputeSummaryJob");
        scheduler.StartScheduledJob<DisputeAbandonedForNoServiceJob>(Configuration["Scheduler:DisputeAbandonedForNoPaymentSchedule"], "DisputeAbandonedForNoServiceJob");
        scheduler.StartScheduledJob<ColdStorageScheduleJob>(Configuration["Scheduler:ColdStorageSchedule"], "ColdStorageScheduleJob");
        scheduler.StartScheduledJob<FactTimeStatisticsJob>(Configuration["Scheduler:FactTimeStatisticsSchedule"], "FactTimeStatisticsJob");
        scheduler.StartScheduledJob<FactIntakeProcessingJob>(Configuration["Scheduler:FactIntakeProcessingSchedule"], "FactIntakeProcessingSchedule");
        scheduler.StartScheduledJob<FactHearingSummaryJob>(Configuration["Scheduler:FactHearingSummarySchedule"], "FactHearingSummaryJob");
        scheduler.StartScheduledJob<AricParticipatoryApplicantEvidenceReminderJob>(Configuration["Scheduler:AricApplicantEvidenceReminderCronSchedule"], "AricApplicantEvidenceReminderJob");
        scheduler.StartScheduledJob<PfrParticipatoryApplicantEvidenceReminderJob>(Configuration["Scheduler:PfrApplicantEvidenceReminderCronSchedule"], "PfrApplicantEvidenceReminderJob");
        scheduler.StartScheduledJob<HearingRecordingTransferJob>(Configuration["Scheduler:HearingRecordingTransferCronSchedule"], "HearingRecordingTransferJob");
    }

    private void UseForwardHeaders(IApplicationBuilder app)
    {
        if (Configuration.GetSection("ForwardProxies").Exists())
        {
            var options = new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.All,
                RequireHeaderSymmetry = false,
                ForwardLimit = null
            };

            var proxyIp = Configuration["ForwardProxies:IP"];
            options.KnownProxies.Add(IPAddress.Parse(proxyIp));

            app.UseForwardedHeaders(options);
        }
    }
}