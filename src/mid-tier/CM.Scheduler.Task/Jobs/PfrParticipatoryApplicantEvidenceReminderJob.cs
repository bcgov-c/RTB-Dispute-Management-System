using System;
using CM.Business.Services.PfrApplicantEvidenceReminder;
using CM.Scheduler.Task.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Serilog;

namespace CM.Scheduler.Task.Jobs;

////UseCase25
[DisallowConcurrentExecution]
public class PfrParticipatoryApplicantEvidenceReminderJob : JobBase
{
    private const string Identity = "pfr-participatory-applicant-evidence-reminder-job";

    public PfrParticipatoryApplicantEvidenceReminderJob(IServiceScopeFactory serviceScopeFactory)
    {
        ServiceScopeFactory = serviceScopeFactory;
    }

    private IServiceScopeFactory ServiceScopeFactory { get; }

    public override async System.Threading.Tasks.Task Execute(IJobExecutionContext context)
    {
        try
        {
            using var scope = ServiceScopeFactory.CreateScope();

            var service = scope.ServiceProvider.GetRequiredService<IPfrParticipatoryApplicantEvidenceReminderService>();
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