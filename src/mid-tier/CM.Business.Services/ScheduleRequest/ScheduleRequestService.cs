using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.ScheduleRequest;
using CM.Common.Utilities;
using CM.Data.Repositories.ScheduleRequest;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.ScheduleRequest;

public class ScheduleRequestService : CmServiceBase, IScheduleRequestService
{
    public ScheduleRequestService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<ScheduleRequestPostResponse> CreateAsync(ScheduleRequestPostRequest request, int requestorId)
    {
        var scheduleRequest = MapperService.Map<ScheduleRequestPostRequest, Data.Model.ScheduleRequest>(request);

        scheduleRequest.RequestorSystemUserId = requestorId;
        scheduleRequest.IsDeleted = false;
        var scheduleRequestResult = await UnitOfWork.ScheduleRequestRepository.InsertAsync(scheduleRequest);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.ScheduleRequest, ScheduleRequestPostResponse>(scheduleRequestResult);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int scheduleRequestId)
    {
        var scheduleRequest = await UnitOfWork.ScheduleRequestRepository.GetByIdAsync(scheduleRequestId);
        if (scheduleRequest != null)
        {
            scheduleRequest.IsDeleted = true;
            UnitOfWork.ScheduleRequestRepository.Attach(scheduleRequest);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<ScheduleRequestGetResponse> GetByIdAsync(int scheduleRequestId)
    {
        var scheduleRequest = await UnitOfWork.ScheduleRequestRepository.GetByIdAsync(scheduleRequestId);
        if (scheduleRequest != null)
        {
            return MapperService.Map<Data.Model.ScheduleRequest, ScheduleRequestGetResponse>(scheduleRequest);
        }

        return null;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.ScheduleRequestRepository.GetLastModifiedDate((int)id);

        return lastModifiedDate;
    }

    public async Task<Data.Model.ScheduleRequest> GetNoTrackingScheduleRequestAsync(int scheduleRequestId)
    {
        var scheduleRequest = await UnitOfWork
            .ScheduleRequestRepository
            .GetByIdAsync(scheduleRequestId);
        return scheduleRequest;
    }

    public async Task<ScheduleRequestFullResponse> GetScheduleRequests(ScheduleRequestsGetRequest request, int count, int index)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var result = new ScheduleRequestFullResponse();

        var queryString = ScheduleRequestQueryBuilder.GenerateRequestsQuery(request);

        var searchResult = await UnitOfWork.ScheduleRequestRepository.FindByQuery(queryString, index, count);
        var totalCount = await UnitOfWork.ScheduleRequestRepository.GetQueryResultCount(queryString);

        if (searchResult != null)
        {
            result.TotalAvailableRecords = totalCount;
            result.ScheduleRequests = MapperService.Map<List<Data.Model.ScheduleRequest>, List<ScheduleRequestGetResponse>>(searchResult);
        }

        return result;
    }

    public async Task<Data.Model.ScheduleRequest> PatchAsync(Data.Model.ScheduleRequest originalRequest)
    {
        UnitOfWork.ScheduleRequestRepository.Attach(originalRequest);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return originalRequest;
        }

        return null;
    }
}