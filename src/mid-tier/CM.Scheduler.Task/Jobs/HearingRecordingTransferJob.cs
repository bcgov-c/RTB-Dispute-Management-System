using System;
using CM.Business.Services.HearingRecordingTransfer;
using CM.Scheduler.Task.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Serilog;

namespace CM.Scheduler.Task.Jobs;

[DisallowConcurrentExecution]
public class HearingRecordingTransferJob : JobBase
{
    private const string Identity = "hearing-recording-transfer-job";

    public HearingRecordingTransferJob(IServiceScopeFactory serviceScopeFactory)
    {
        ServiceScopeFactory = serviceScopeFactory;
    }

    private IServiceScopeFactory ServiceScopeFactory { get; }

    public override async System.Threading.Tasks.Task Execute(IJobExecutionContext context)
    {
        try
        {
            using var scope = ServiceScopeFactory.CreateScope();

            var service = scope.ServiceProvider.GetRequiredService<IHearingRecordingTransferService>();
            await service.ProcessHearingRecordingTransfer();
            context.Result = true;
            Log.Information(Identity + " succeeded");
        }
        catch (Exception e)
        {
            throw new JobExecutionException(e);
        }
    }
}