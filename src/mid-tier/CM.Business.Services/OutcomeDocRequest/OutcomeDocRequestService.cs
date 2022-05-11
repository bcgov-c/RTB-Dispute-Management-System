using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.OutcomeDocRequest;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.OutcomeDocRequest;

public class OutcomeDocRequestService : CmServiceBase, IOutcomeDocRequestService
{
    public OutcomeDocRequestService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<OutcomeDocRequestResponse> CreateAsync(Guid disputeGuid, OutcomeDocRequestRequest request)
    {
        var newOutcomeDocRequest = MapperService.Map<OutcomeDocRequestRequest, Data.Model.OutcomeDocRequest>(request);
        newOutcomeDocRequest.DisputeGuid = disputeGuid;
        newOutcomeDocRequest.IsDeleted = false;

        var outcomeDocRequestResult = await UnitOfWork.OutcomeDocRequestRepository.InsertAsync(newOutcomeDocRequest);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.OutcomeDocRequest, OutcomeDocRequestResponse>(outcomeDocRequestResult);
        }

        return null;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.OutcomeDocRequestRepository.GetLastModifiedDate((int)id);

        return lastModifiedDate;
    }

    public async Task<Data.Model.OutcomeDocRequest> GetNoTrackingOutcomeDocRequestAsync(int outcomeDocRequestId)
    {
        var outcomeDocRequest = await UnitOfWork.OutcomeDocRequestRepository.GetNoTrackingByIdAsync(r =>
            r.OutcomeDocRequestId == outcomeDocRequestId);
        return outcomeDocRequest;
    }

    public async Task<Data.Model.OutcomeDocRequest> PatchAsync(Data.Model.OutcomeDocRequest originalOutcomeDocRequest)
    {
        UnitOfWork.OutcomeDocRequestRepository.Attach(originalOutcomeDocRequest);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return originalOutcomeDocRequest;
        }

        return null;
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entity = await UnitOfWork.OutcomeDocRequestRepository.GetNoTrackingByIdAsync(c => c.OutcomeDocRequestId == id);
        return entity?.DisputeGuid ?? Guid.Empty;
    }

    public async Task<bool> IsActiveSubmitter(Guid disputeGuid, int submitterId)
    {
        var participant = await UnitOfWork.ParticipantRepository.GetDisputeActiveParticipant(disputeGuid, submitterId);
        return participant != null;
    }

    public async Task<bool> IsActiveFileDescription(Guid disputeGuid, int fileDescriptionId)
    {
        var fileDescription = await UnitOfWork.FileDescriptionRepository.GetFileDescription(disputeGuid, fileDescriptionId);
        return fileDescription != null;
    }

    public async Task<bool> IsActiveOutcomeDocGroup(Guid disputeGuid, int outcomeDocGroupId)
    {
        var outcomeDocGroup = await UnitOfWork.OutcomeDocGroupRepository.GetDocGroup(disputeGuid, outcomeDocGroupId);
        return outcomeDocGroup != null;
    }

    public async Task<bool> DeleteAsync(int outcomeDocRequestId)
    {
        var outcomeDocRequest = await UnitOfWork.OutcomeDocRequestRepository.GetByIdAsync(outcomeDocRequestId);
        if (outcomeDocRequest != null)
        {
            outcomeDocRequest.IsDeleted = true;
            UnitOfWork.OutcomeDocRequestRepository.Attach(outcomeDocRequest);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<bool> IsAnyOutcomeDocReqItems(int outcomeDocRequestId)
    {
        var isAnyReqItems = await UnitOfWork.OutcomeDocRequestItemRepository.IsAnyReqItemsExist(outcomeDocRequestId);
        return isAnyReqItems;
    }

    public async Task<OutcomeDocRequestGetResponse> GetByIdAsync(int outcomeDocRequestId)
    {
        var outcomeDocRequest = await UnitOfWork.OutcomeDocRequestRepository.GetByIdWithChild(outcomeDocRequestId);
        if (outcomeDocRequest != null)
        {
            return MapperService.Map<Data.Model.OutcomeDocRequest, OutcomeDocRequestGetResponse>(outcomeDocRequest);
        }

        return null;
    }

    public async Task<List<OutcomeDocRequestGetResponse>> GetByDispute(Guid disputeGuid)
    {
        var outcomeDocRequests = await UnitOfWork.OutcomeDocRequestRepository.GetByDisputeWithChild(disputeGuid);
        if (outcomeDocRequests != null)
        {
            return MapperService.Map<List<Data.Model.OutcomeDocRequest>, List<OutcomeDocRequestGetResponse>>(outcomeDocRequests);
        }

        return null;
    }
}