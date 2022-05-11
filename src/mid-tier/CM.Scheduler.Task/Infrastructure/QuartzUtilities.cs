using System;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Quartz.Impl;
using Quartz.Impl.Matchers;
using Quartz.Spi;

namespace CM.Scheduler.Task.Infrastructure;

public static class QuartzUtilities
{
    public static void StartScheduledJob<TJob>(this IScheduler scheduler, string cronSchedule, string jobName = null, JobDataMap dataMap = null)
        where TJob : IJob
    {
        if (string.IsNullOrWhiteSpace(cronSchedule))
        {
            throw new ArgumentNullException($"Configuration for {jobName} is missing");
        }

        jobName ??= typeof(TJob).FullName;

        var job = JobBuilder.Create<TJob>()
            .WithIdentity(jobName)
            .SetJobData(dataMap ?? new JobDataMap())
            .Build();

        var trigger = TriggerBuilder.Create()
            .WithIdentity(jobName)
            .StartNow()
            .WithCronSchedule(cronSchedule)
            .Build();

        scheduler.ScheduleJob(job, trigger);
    }

    public static IServiceCollection UseQuartz(this IServiceCollection services, params Type[] jobs)
    {
        services.AddSingleton<IJobFactory, QuartzJobFactory>();
        services.AddSingleton<IJobListener, JobListener>();

        var serviceDescriptors =
            jobs.Select(jobType => new ServiceDescriptor(jobType, jobType, ServiceLifetime.Singleton));

        foreach (var serviceDescriptor in serviceDescriptors)
        {
            services.Add(serviceDescriptor);
        }

        services.AddSingleton(provider =>
        {
            var schedulerFactory = new StdSchedulerFactory();
            var scheduler = schedulerFactory.GetScheduler().Result;
            scheduler.JobFactory = provider.GetService<IJobFactory>();
            var jobListener = provider.GetService<IJobListener>();
            scheduler.ListenerManager.AddJobListener(jobListener, GroupMatcher<JobKey>.AnyGroup());
            scheduler.Start().Wait();
            return scheduler;
        });

        return services;
    }
}