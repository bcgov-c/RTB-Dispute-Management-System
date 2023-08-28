using System.Linq;
using CM.Data.Model;
using CM.Scheduler.Task.Infrastructure;
using CM.Scheduler.Task.Jobs;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Quartz;

namespace CM.WebAPI;

public static partial class CustomExtensionsMethods
{
    public static IServiceCollection AddScheduler(this IServiceCollection services, IConfiguration configuration)
    {
        services.UseQuartz(configuration);

        return services;
    }

    public static async void ConfigureAdHocFileCleanupScheduler(this IApplicationBuilder app)
    {
        var serviceScopeFactory = (IServiceScopeFactory)app.ApplicationServices.GetService(typeof(IServiceScopeFactory));

        if (serviceScopeFactory == null)
        {
            return;
        }

        using var scope = serviceScopeFactory.CreateScope();

        var services = scope.ServiceProvider;
        var schedulerFactory = app.ApplicationServices.GetRequiredService<ISchedulerFactory>();
        var scheduler = await schedulerFactory.GetScheduler();

        var context = services.GetService<CaseManagementContext>();

        if (context == null)
        {
            return;
        }

        var adHocFileCleanup = await context.AdHocFileCleanup.AsNoTracking().ToListAsync();

        foreach (var item in adHocFileCleanup.Where(item => item.IsActive))
        {
            var cronJob = item.CronJob;
            var cronJobName = "adHocFileCleanup" + item.AdHocFileCleanupId;
            var jobDataMap = new JobDataMap();
            jobDataMap.Put("AdHocFileCleanup", item);
            await scheduler.StartScheduledJob<AdHocFileCleanupJob>(cronJob, cronJobName, jobDataMap);
        }
    }
}