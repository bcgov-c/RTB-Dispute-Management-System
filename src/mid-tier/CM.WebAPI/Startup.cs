using System;
using CM.Common.ChunkedFileUpload;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.ServiceBase;
using CM.ServiceBase.ApiKey;
using CM.Storage;
using CM.Storage.Config;
using CM.WebAPI.Configuration;
using CM.WebAPI.WebApiHelpers;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
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
        services.Configure<ApiKeySettings>(Configuration.GetSection("ApiKeySettings"));

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

        app.ConfigureAdHocFileCleanupScheduler();

        app.UseEnableRequestBuffering();
        app.UseErrorWrappingMiddleware();
        app.UseAuditLogging();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();

            endpoints.MapHealthChecks("/check", new HealthCheckOptions
            {
                Predicate = _ => true,
                ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
            });

            if (Configuration.GetSection("HealthServices").Exists())
            {
                endpoints.MapHealthChecksUI(options =>
                {
                    options.UIPath = Configuration["HealthServices:health-ui"];
                    options.ApiPath = Configuration["HealthServices:health-ui-api"];
                    options.AddCustomStylesheet("dotnet.css");
                });
            }
        });

        app.UseForwardHeaders(Configuration);

        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.DocExpansion(DocExpansion.None);
            c.SwaggerEndpoint("../swagger/v1/swagger.json", "Case Management V1");
        });
    }
}