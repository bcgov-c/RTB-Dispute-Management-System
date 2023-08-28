using System;
using CM.Business.Services.ManualHearingVerification;
using CM.Scheduler.Task.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Serilog;

namespace CM.Scheduler.Task.Jobs
{
    [DisallowConcurrentExecution]
    public class MhvAppNotLinkedFirstScheduleJob : JobBase
    {
        private const string Identity = "MHV-App-Not-Linked-First-Schedule-Job";

        public MhvAppNotLinkedFirstScheduleJob(IServiceScopeFactory serviceScopeFactory)
        {
            ServiceScopeFactory = serviceScopeFactory;
        }

        private IServiceScopeFactory ServiceScopeFactory { get; }

        public override async System.Threading.Tasks.Task Execute(IJobExecutionContext context)
        {
            try
            {
                using var scope = ServiceScopeFactory.CreateScope();

                var service = scope.ServiceProvider.GetRequiredService<IManualHearingVerificationService>();
                await service.RunMhvAppNotLinkedFirstReminder();
                context.Result = true;
                Log.Information(Identity + " succeeded");
            }
            catch (Exception e)
            {
                throw new JobExecutionException(e);
            }
        }
    }
}
