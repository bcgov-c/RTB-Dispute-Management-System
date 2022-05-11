using Quartz;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Job;

public abstract class JobBase : IJob
{
    public virtual System.Threading.Tasks.Task Execute(IJobExecutionContext context)
    {
        throw new System.NotImplementedException();
    }
}