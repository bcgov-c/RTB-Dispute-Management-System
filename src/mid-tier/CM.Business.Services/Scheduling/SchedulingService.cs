using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Data.Repositories.UnitOfWork;
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
        if (ServiceProvider.GetService(typeof(IScheduler)) is IScheduler scheduler)
        {
            var keys = await scheduler.GetJobKeys(GroupMatcher<JobKey>.GroupEquals("DEFAULT"));
            var jobKey = keys.Single(arg => arg.Name == jobName);
            await scheduler.TriggerJob(jobKey);

            return true;
        }

        return false;
    }
}