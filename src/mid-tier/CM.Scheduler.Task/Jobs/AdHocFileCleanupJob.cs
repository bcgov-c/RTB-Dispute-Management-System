using System;
using CM.Business.Services.AdHocFileCleanup;
using CM.Data.Model.AdHocFile;
using CM.Scheduler.Task.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Serilog;

namespace CM.Scheduler.Task.Jobs;

[DisallowConcurrentExecution]
public class AdHocFileCleanupJob : JobBase
{
    private const string Identity = "adhoc-file-cleanup-job";

    public AdHocFileCleanupJob(IServiceScopeFactory serviceScopeFactory)
    {
        ServiceScopeFactory = serviceScopeFactory;
    }

    private IServiceScopeFactory ServiceScopeFactory { get; }

    public override async System.Threading.Tasks.Task Execute(IJobExecutionContext context)
    {
        try
        {
            using var scope = ServiceScopeFactory.CreateScope();

            var adHocFileCleanup = context.JobDetail.JobDataMap.Get("AdHocFileCleanup") as AdHocFileCleanup;
            var service = scope.ServiceProvider.GetRequiredService<IScheduledAdHocFileCleanupService>();
            await service.RunAdHocFileCleanup(adHocFileCleanup);

            Log.Information(Identity + " succeeded");
        }
        catch (Exception e)
        {
            throw new JobExecutionException(e);
        }
    }
}