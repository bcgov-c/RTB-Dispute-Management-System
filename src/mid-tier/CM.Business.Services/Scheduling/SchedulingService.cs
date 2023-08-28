using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Data.Repositories.UnitOfWork;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Quartz.Impl.Matchers;

namespace CM.Business.Services.Scheduling;

public class SchedulingService : CmServiceBase, ISchedulingService
{
    public SchedulingService(IMapper mapper, IUnitOfWork unitOfWork, IServiceProvider serviceProvider)
        : base(unitOfWork, mapper)
    {
        ServiceProvider = serviceProvider;
    }

    private IServiceProvider ServiceProvider { get; }

    public async Task<bool> RubJob(string jobName)
    {
        var schedulerFactory = ServiceProvider.GetRequiredService<ISchedulerFactory>();
        var scheduler = await schedulerFactory.GetScheduler();

        var keys = await scheduler.GetJobKeys(GroupMatcher<JobKey>.AnyGroup());
        var jobKey = keys.SingleOrDefault(arg => arg.Name == jobName);
        if (jobKey == null)
        {
            return false;
        }

        await scheduler.TriggerJob(jobKey);

        return true;
    }
}