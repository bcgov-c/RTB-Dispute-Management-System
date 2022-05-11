using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.OutcomeDocRequest;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.OutcomeDocRequest;

public class OutcomeDocRequestItemService : CmServiceBase, IOutcomeDocRequestItemService
{
    public OutcomeDocRequestItemService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<OutcomeDocRequestItemResponse> CreateAsync(int outcomeDocRequestId, OutcomeDocRequestItemRequest request)
    {
        var newOutcomeDocRequestItem = MapperService.Map<OutcomeDocRequestItemRequest, Data.Model.OutcomeDocReqItem>(request);
        newOutcomeDocRequestItem.OutcomeDocRequestId = outcomeDocRequestId;
        newOutcomeDocRequestItem.IsDeleted = false;

        var outcomeDocRequestItemResult = await UnitOfWork.OutcomeDocRequestItemRepository.InsertAsync(newOutcomeDocRequestItem);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.OutcomeDocReqItem, OutcomeDocRequestItemResponse>(outcomeDocRequestItemResult);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int outcomeDocReqItemId)
    {
        var outcomeDocRequestItem = await UnitOfWork.OutcomeDocRequestItemRepository.GetByIdAsync(outcomeDocReqItemId);
        if (outcomeDocRequestItem != null)
        {
            outcomeDocRequestItem.IsDeleted = true;
            UnitOfWork.OutcomeDocRequestItemRepository.Attach(outcomeDocRequestItem);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.OutcomeDocRequestItemRepository.GetLastModifiedDate((int)id);

        return lastModifiedDate;
    }

    public async Task<Data.Model.OutcomeDocReqItem> GetNoTrackingOutcomeDocRequestItemAsync(int outcomeDocReqItemId)
    {
        var outcomeDocRequestItem = await UnitOfWork.OutcomeDocRequestItemRepository.GetNoTrackingByIdAsync(r =>
            r.OutcomeDocReqItemId == outcomeDocReqItemId);
        return outcomeDocRequestItem;
    }

    public async Task<bool> IsActiveFileDescription(int outcomeDocRequestId, int fileDescriptionId)
    {
        var outcomeDocRequest = await UnitOfWork.OutcomeDocRequestRepository.GetByIdAsync(outcomeDocRequestId);
        var fileDescription = await UnitOfWork.FileDescriptionRepository.GetFileDescription(outcomeDocRequest.DisputeGuid, fileDescriptionId);
        return fileDescription != null;
    }

    public async Task<bool> OutcomeDocRequestExists(int outcomeDocRequestId)
    {
        var isExist = await UnitOfWork.OutcomeDocRequestRepository.IsOutcomeDocRequestExist(outcomeDocRequestId);
        return isExist;
    }

    public async Task<Data.Model.OutcomeDocReqItem> PatchAsync(Data.Model.OutcomeDocReqItem originalOutcomeDocRequestItem)
    {
        UnitOfWork.OutcomeDocRequestItemRepository.Attach(originalOutcomeDocRequestItem);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return originalOutcomeDocRequestItem;
        }

        return null;
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entity = await UnitOfWork.OutcomeDocRequestItemRepository.GetNoTrackingByIdAsync(c => c.OutcomeDocReqItemId == id);
        var parentEntity = entity != null ? await UnitOfWork.OutcomeDocRequestRepository.GetNoTrackingByIdAsync(x => x.OutcomeDocRequestId == entity.OutcomeDocRequestId) : null;
        return parentEntity?.DisputeGuid ?? Guid.Empty;
    }
}