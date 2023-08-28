using System.Threading;
using Quartz;
using Serilog;

namespace CM.Scheduler.Task.Infrastructure;

public class JobListener : IJobListener
{
    public JobListener(ILogger logger)
    {
        Logger = logger;
    }

    public string Name => "MainJobListener";

    private ILogger Logger { get; }

    public System.Threading.Tasks.Task JobToBeExecuted(IJobExecutionContext context, CancellationToken cancellationToken = new())
    {
        Logger.Warning("Job {JobName} is about to be executed", context.JobDetail.Key.Name);
        return System.Threading.Tasks.Task.CompletedTask;
    }

    public System.Threading.Tasks.Task JobExecutionVetoed(IJobExecutionContext context, CancellationToken cancellationToken = new())
    {
        Logger.Warning("Job {JobName} was vetoed", context.JobDetail.Key.Name);
        return System.Threading.Tasks.Task.CompletedTask;
    }

    public System.Threading.Tasks.Task JobWasExecuted(
        IJobExecutionContext context,
        JobExecutionException jobException,
        CancellationToken cancellationToken = new())
    {
        if (jobException != null)
        {
            Logger.Error(jobException.InnerException,
                "Job {JobName} was failed in {JobRunTime} seconds",
                context.JobDetail.Key.Name,
                context.JobRunTime.TotalSeconds);

            return System.Threading.Tasks.Task.CompletedTask;
        }

        Logger.Warning("Job {JobName} was executed in {JobRunTime} seconds",
            context.JobDetail.Key.Name,
            context.JobRunTime.TotalSeconds);

        return System.Threading.Tasks.Task.CompletedTask;
    }
}