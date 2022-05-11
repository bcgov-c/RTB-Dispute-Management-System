using System;
using CM.Business.Services.ScheduledHearingReminder;
using CM.Scheduler.Task.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Serilog;

namespace CM.Scheduler.Task.Jobs;

////UseCase6
[DisallowConcurrentExecution]
public class ParticipatoryApplicantEvidenceReminderJob : JobBase
{
    private const string Identity = "participatory-applicant-evidence-reminder-job";

    public ParticipatoryApplicantEvidenceReminderJob(IServiceScopeFactory serviceScopeFactory)
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
            await service.ParticipatoryApplicantEvidenceReminderNotifications();
            context.Result = true;
            Log.Information(Identity + " succeeded");
        }
        catch (Exception e)
        {
            throw new JobExecutionException(e);
        }
    }
}