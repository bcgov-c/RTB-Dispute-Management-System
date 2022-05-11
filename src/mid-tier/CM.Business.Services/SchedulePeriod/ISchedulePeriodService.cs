using System.Threading.Tasks;
using CM.Business.Entities.Models.SchedulePeriod;

namespace CM.Business.Services.SchedulePeriod;

public interface ISchedulePeriodService : IServiceBase
{
    Task<SchedulePeriodPostResponse> CreateAsync(SchedulePeriodPostRequest request);

    Task<Data.Model.SchedulePeriod> GetNoTrackingSchedulePeriodAsync(int schedulePeriodId);

    Task<Data.Model.SchedulePeriod> PatchAsync(Data.Model.SchedulePeriod originalPeriod);

    Task<SchedulePeriodGetResponse> GetByIdAsync(int schedulePeriodId);

    Task<SchedulePeriodGetFilterResponse> Get(SchedulePeriodGetRequest request, int count, int index);

    Task<Data.Model.SchedulePeriod> GetSchedulePeriod(int schedulePeriodId);
}