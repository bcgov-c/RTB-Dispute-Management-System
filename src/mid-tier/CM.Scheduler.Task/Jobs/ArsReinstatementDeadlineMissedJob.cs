using System;
using CM.Business.Services.ArsReminder;
using CM.Scheduler.Task.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Serilog;

namespace CM.Scheduler.Task.Jobs
{
    [DisallowConcurrentExecution]
    public class ArsReinstatementDeadlineMissedJob : JobBase
    {
        private const string Identity = "ars-reinstatement-deadline-missed-job";

        public ArsReinstatementDeadlineMissedJob(IServiceScopeFactory serviceScopeFactory)
        {
            ServiceScopeFactory = serviceScopeFactory;
        }

        private IServiceScopeFactory ServiceScopeFactory { get; }

        public override async System.Threading.Tasks.Task Execute(IJobExecutionContext context)
        {
            try
            {
                using var scope = ServiceScopeFactory.CreateScope();

                var service = scope.ServiceProvider.GetRequiredService<IArsReminderService>();
                await service.ArsReinstatementDeadlineMissedNotifications();
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
