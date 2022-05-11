using System;
using CM.Business.Services.AbandonedDisputesNotification;
using CM.Scheduler.Task.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Serilog;

namespace CM.Scheduler.Task.Jobs;

////UseCase15
[DisallowConcurrentExecution]
public class DisputeAbandonedDueToApplicantInactionJob : JobBase
{
    private const string Identity = "dispute-abandoned-due-to-applicant-inaction-job";

    public DisputeAbandonedDueToApplicantInactionJob(IServiceScopeFactory serviceScopeFactory)
    {
        ServiceScopeFactory = serviceScopeFactory;
    }

    private IServiceScopeFactory ServiceScopeFactory { get; }

    public override async System.Threading.Tasks.Task Execute(IJobExecutionContext context)
    {
        try
        {
            using var scope = ServiceScopeFactory.CreateScope();

            var service = scope.ServiceProvider.GetRequiredService<IDisputeAbandonedDueToApplicantInactionService>();
            await service.ProcessNotifications();

            context.Result = true;
            Log.Information(Identity + " succeeded");
        }
        catch (Exception e)
        {
            throw new JobExecutionException(e);
        }
    }
}