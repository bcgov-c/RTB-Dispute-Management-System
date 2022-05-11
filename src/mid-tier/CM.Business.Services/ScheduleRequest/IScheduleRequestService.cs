using System.Threading.Tasks;
using CM.Business.Entities.Models.ScheduleRequest;

namespace CM.Business.Services.ScheduleRequest;

public interface IScheduleRequestService : IServiceBase
{
    Task<ScheduleRequestPostResponse> CreateAsync(ScheduleRequestPostRequest request, int requestorId);

    Task<Data.Model.ScheduleRequest> GetNoTrackingScheduleRequestAsync(int scheduleRequestId);

    Task<Data.Model.ScheduleRequest> PatchAsync(Data.Model.ScheduleRequest originalRequest);

    Task<bool> DeleteAsync(int scheduleRequestId);

    Task<ScheduleRequestGetResponse> GetByIdAsync(int scheduleRequestId);

    Task<ScheduleRequestFullResponse> GetScheduleRequests(ScheduleRequestsGetRequest request, int count, int index);
}