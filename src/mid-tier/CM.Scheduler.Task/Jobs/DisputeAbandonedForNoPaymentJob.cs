using System;
using CM.Business.Services.DisputeAbandonedForNoPayment;
using CM.Scheduler.Task.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Serilog;

namespace CM.Scheduler.Task.Jobs;

////UseCase3
[DisallowConcurrentExecution]
public class DisputeAbandonedForNoPaymentJob : JobBase
{
    private const string Identity = "dispute-abandoned-for-no-payment-job";

    public DisputeAbandonedForNoPaymentJob(IServiceScopeFactory serviceScopeFactory)
    {
        ServiceScopeFactory = serviceScopeFactory;
    }

    private IServiceScopeFactory ServiceScopeFactory { get; }

    public override async System.Threading.Tasks.Task Execute(IJobExecutionContext context)
    {
        try
        {
            using var scope = ServiceScopeFactory.CreateScope();

            var service = scope.ServiceProvider.GetRequiredService<IDisputeAbandonedForNoPaymentService>();
            await service.ProcessDisputeAbandonedForNoPayment();
            context.Result = true;
            Log.Information(Identity + " succeeded");
        }
        catch (Exception e)
        {
            throw new JobExecutionException(e);
        }
    }
}