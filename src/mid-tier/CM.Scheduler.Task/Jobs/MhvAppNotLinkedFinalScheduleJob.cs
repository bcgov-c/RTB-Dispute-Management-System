using System;
using CM.Business.Services.ManualHearingVerification;
using CM.Scheduler.Task.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Serilog;

namespace CM.Scheduler.Task.Jobs
{
    [DisallowConcurrentExecution]
    public class MhvAppNotLinkedFinalScheduleJob : JobBase
    {
        private const string Identity = "Mhv-App-NotLinked-Final-Schedule-Job";

        public MhvAppNotLinkedFinalScheduleJob(IServiceScopeFactory serviceScopeFactory)
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
                await service.RunMhvAppNotLinkedFinalReminder();
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
