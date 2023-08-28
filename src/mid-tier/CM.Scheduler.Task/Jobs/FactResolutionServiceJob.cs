using System;
using CM.Business.Services.FactResolutionServiceScheduling;
using CM.Scheduler.Task.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Serilog;

namespace CM.Scheduler.Task.Jobs
{
    [DisallowConcurrentExecution]
    public class FactResolutionServiceJob : JobBase
    {
        private const string Identity = "fact-resolution-service-job";

        public FactResolutionServiceJob(IServiceScopeFactory serviceScopeFactory)
        {
            ServiceScopeFactory = serviceScopeFactory;
        }

        private IServiceScopeFactory ServiceScopeFactory { get; }

        public override async System.Threading.Tasks.Task Execute(IJobExecutionContext context)
        {
            try
            {
                using var scope = ServiceScopeFactory.CreateScope();

                var service = scope.ServiceProvider.GetRequiredService<IFactResolutionServiceSchedulingService>();
                await service.ProcessFactResolutionService();
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
