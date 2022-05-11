using System;
using Quartz;
using Quartz.Spi;

namespace CM.Scheduler.Task.Infrastructure;

public class QuartzJobFactory : IJobFactory
{
    private readonly IServiceProvider _serviceProvider;

    public QuartzJobFactory(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public IJob NewJob(TriggerFiredBundle bundle, IScheduler scheduler)
    {
        var jobDetail = bundle.JobDetail;

        var job = (IJob)_serviceProvider.GetService(jobDetail.JobType);
        return job;
    }

    public void ReturnJob(IJob job)
    {
    }
}