using System;
using CM.Business.Services.ScheduledHearingReminder;
using CM.Scheduler.Task.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Serilog;

namespace CM.Scheduler.Task.Jobs;

////UseCase26
[DisallowConcurrentExecution]
public class ParticipatoryEmergRespondentEvidenceReminderPeriodJob : JobBase
{
    private const string Identity = "participatory-emerg-respondent-evidence-reminder-period-job";

    public ParticipatoryEmergRespondentEvidenceReminderPeriodJob(IServiceScopeFactory serviceScopeFactory)
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
            await service.ParticipatoryEmergRespondentEvidenceReminderPeriodNotifications();
            context.Result = true;
            Log.Information(Identity + " succeeded");
        }
        catch (Exception e)
        {
            throw new JobExecutionException(e);
        }
    }
}