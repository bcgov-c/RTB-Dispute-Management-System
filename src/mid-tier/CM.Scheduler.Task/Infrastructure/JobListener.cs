using System.Threading;
using CM.Business.Entities.Models.CronJobHistory;
using CM.Business.Services.CronJobHistory;
using Microsoft.Extensions.DependencyInjection;
using Quartz;

namespace CM.Scheduler.Task.Infrastructure;

public class JobListener : IJobListener
{
    public JobListener(IServiceScopeFactory serviceScopeFactory)
    {
        ServiceScopeFactory = serviceScopeFactory;
    }

    public string Name => "JobListenerName";

    private IServiceScopeFactory ServiceScopeFactory { get; }

    public System.Threading.Tasks.Task JobToBeExecuted(IJobExecutionContext context, CancellationToken cancellationToken = default)
    {
        return System.Threading.Tasks.Task.CompletedTask;
    }

    public System.Threading.Tasks.Task JobExecutionVetoed(IJobExecutionContext context, CancellationToken cancellationToken = default)
    {
        return System.Threading.Tasks.Task.CompletedTask;
    }

    public System.Threading.Tasks.Task JobWasExecuted(IJobExecutionContext context, JobExecutionException jobException, CancellationToken cancellationToken = default)
    {
        using var scope = ServiceScopeFactory.CreateScope();

        var service = scope.ServiceProvider.GetRequiredService<ICronJobHistoryService>();

        var request = new CronJobRequest
        {
            JobStart = context.FireTimeUtc.DateTime,
            JobRunTime = context.JobRunTime,
            JobName = context.JobDetail.Key.Name,
            JobResult = context.Result != null && (bool)context.Result
        };
        service.CreateAsync(request);

        return System.Threading.Tasks.Task.CompletedTask;
    }
}