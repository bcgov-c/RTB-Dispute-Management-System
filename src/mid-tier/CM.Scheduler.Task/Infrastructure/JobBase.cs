using Quartz;

namespace CM.Scheduler.Task.Infrastructure;

public abstract class JobBase : IJob
{
    public virtual System.Threading.Tasks.Task Execute(IJobExecutionContext context)
    {
        throw new System.NotImplementedException();
    }
}