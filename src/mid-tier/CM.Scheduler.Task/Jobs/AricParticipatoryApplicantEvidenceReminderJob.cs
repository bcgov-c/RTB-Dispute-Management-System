using System;
using CM.Business.Services.AricApplicantEvidenceReminder;
using CM.Scheduler.Task.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Serilog;

namespace CM.Scheduler.Task.Jobs;

////UseCase24
[DisallowConcurrentExecution]
public class AricParticipatoryApplicantEvidenceReminderJob : JobBase
{
    private const string Identity = "aric-participatory-applicant-evidence-reminder-job";

    public AricParticipatoryApplicantEvidenceReminderJob(IServiceScopeFactory serviceScopeFactory)
    {
        ServiceScopeFactory = serviceScopeFactory;
    }

    private IServiceScopeFactory ServiceScopeFactory { get; }

    public override async System.Threading.Tasks.Task Execute(IJobExecutionContext context)
    {
        try
        {
            using var scope = ServiceScopeFactory.CreateScope();

            var service = scope.ServiceProvider.GetRequiredService<IAricApplicantEvidenceReminderService>();
            await service.Handle();
            context.Result = true;
            Log.Information(Identity + " succeeded");
        }
        catch (Exception e)
        {
            throw new JobExecutionException(e);
        }
    }
}