using System;
using CM.Business.Services.DisputeAbandonedForNoService;
using CM.Scheduler.Task.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Serilog;

namespace CM.Scheduler.Task.Jobs;

////UseCase16
[DisallowConcurrentExecution]
public class DisputeAbandonedForNoServiceJob : JobBase
{
    private const string Identity = "dispute-abandoned-for-no-service-job ";

    public DisputeAbandonedForNoServiceJob(IServiceScopeFactory serviceScopeFactory)
    {
        ServiceScopeFactory = serviceScopeFactory;
    }

    private IServiceScopeFactory ServiceScopeFactory { get; }

    public override async System.Threading.Tasks.Task Execute(IJobExecutionContext context)
    {
        try
        {
            using var scope = ServiceScopeFactory.CreateScope();

            var service = scope.ServiceProvider.GetRequiredService<IDisputeAbandonedDueToApplicantServiceInactionService>();
            await service.ProcessDisputeAbandonedForNoService();
            context.Result = true;
            Log.Information(Identity + " succeeded");
        }
        catch (Exception e)
        {
            throw new JobExecutionException(e);
        }
    }
}