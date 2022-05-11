using System.Threading.Tasks;

namespace CM.Business.Services.Scheduling;

public interface ISchedulingService
{
    Task<bool> RubJob(string jobName);
}