using System;
using CM.Business.Services.ColdStorage;
using CM.Scheduler.Task.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Serilog;

namespace CM.Scheduler.Task.Jobs;

[DisallowConcurrentExecution]
public class ColdStorageScheduleJob : JobBase
{
    private const string Identity = "cold-storage-schedule-job";

    public ColdStorageScheduleJob(IServiceScopeFactory serviceScopeFactory)
    {
        ServiceScopeFactory = serviceScopeFactory;
    }

    private IServiceScopeFactory ServiceScopeFactory { get; }

    public override async System.Threading.Tasks.Task Execute(IJobExecutionContext context)
    {
        try
        {
            using var scope = ServiceScopeFactory.CreateScope();

            var service = scope.ServiceProvider.GetRequiredService<IColdStorageMigrationService>();
            await service.MigrateFilesToColdStorage();
            await service.CleanUpEmptyDirectories();
            context.Result = true;
            Log.Information(Identity + " succeeded");
        }
        catch (Exception e)
        {
            throw new JobExecutionException(e);
        }
    }
}