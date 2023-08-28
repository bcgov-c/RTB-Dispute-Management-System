using System;
using System.Linq;
using System.Threading.Tasks;
using CM.ServiceBase;
using CM.ServiceBase.ApiKey;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Job;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Quartz;
using Serilog;
using Swashbuckle.AspNetCore.SwaggerUI;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService;

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
        services.Configure<ApiKeySettings>(Configuration.GetSection("ApiKeySettings"));

        services.AddControllers().AddNewtonsoftJson();
        services
            .AddLogger(Configuration)
            .AddMapper(Configuration)
            .AddRepositories()
            .AddCustomIntegrations(Configuration)
            .AddCustomMvc()
            .AddHealthChecks(Configuration)
            .AddCustomDbContext(Configuration)
            .AddSwagger(Configuration, "AdHoc Report Sender Service", true)
            .AddScheduler(Configuration);
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory)
    {
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
        loggerFactory.AddSerilog();

        app.UseSafeListFiltering(Configuration);
        app.UseRouting();
        app.UseEndpoints(endpoints => { endpoints.MapControllers(); });

        app.UseDataBaseMigrations<AdHocReportContext>(Configuration);

        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.DocExpansion(DocExpansion.None);
            c.SwaggerEndpoint("../swagger/v1/swagger.json", "AdHoc Report Sender Service API V1");
        });

        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }
        else
        {
            app.UseHsts();
        }

        ConfigureScheduler(app).Wait();

        app.UseHealthChecks("/check");
    }

    private async Task<bool> ConfigureScheduler(IApplicationBuilder app)
    {
        var serviceScopeFactory = (IServiceScopeFactory)app.ApplicationServices.GetService(typeof(IServiceScopeFactory));

        if (serviceScopeFactory != null)
        {
            using var scope = serviceScopeFactory.CreateScope();

            var services = scope.ServiceProvider;
            var scheduler = services.GetService<IScheduler>();
            var context = services.GetService<AdHocReportContext>();

            if (context == null)
            {
                return await Task.FromResult(false);
            }

            var adHocReports = await context.AdHocReports.AsNoTracking().ToListAsync();

            foreach (var item in adHocReports.Where(item => item.IsActive))
            {
                var cronJob = item.CronJob;
                var cronJobName = item.Description;
                var jobDataMap = new JobDataMap();
                jobDataMap.Put("AdHocReport", item);

                scheduler.StartScheduledJob<AdHocReportJob>(cronJob, cronJobName, jobDataMap);
            }
        }

        return await Task.FromResult(true);
    }
}