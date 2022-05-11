using System;
using CM.Business.Services.ScheduledHearingReminder;
using CM.Scheduler.Task.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Serilog;

namespace CM.Scheduler.Task.Jobs;

////UseCase7
[DisallowConcurrentExecution]
public class ParticipatoryRespondentEvidenceReminderJob : JobBase
{
    private const string Identity = "participatory-respondent-evidence-reminder-job";

    public ParticipatoryRespondentEvidenceReminderJob(IServiceScopeFactory serviceScopeFactory)
    {
        ServiceScopeFactory = serviceScopeFactory;
    }

    private IServiceScopeFactory ServiceScopeFactory { get; }

    public override async System.Threading.Tasks.Task Execute(IJobExecutionContext context)
    {
        try
        {
            using var scope = ServiceScopeFactory.CreateScope();

            var service = scope.ServiceProvider.GetRequiredService<IScheduledReminderService>();
            await service.ParticipatoryRespondentEvidenceReminderNotifications();
            context.Result = true;
            Log.Information(Identity + " succeeded");
        }
        catch (Exception e)
        {
            throw new JobExecutionException(e);
        }
    }
}