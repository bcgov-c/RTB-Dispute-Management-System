using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.OutcomeDocument;

public class OutcomeDocGroupService : CmServiceBase, IOutcomeDocGroupService
{
    public OutcomeDocGroupService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entity = await UnitOfWork.OutcomeDocGroupRepository.GetNoTrackingByIdAsync(c => c.OutcomeDocGroupId == id);
        return entity?.DisputeGuid ?? Guid.Empty;
    }

    public async Task<OutcomeDocGroupResponse> CreateAsync(Guid disputeGuid, OutcomeDocGroupRequest outcomeDocGroup)
    {
        var newOutcomeDocGroup = MapperService.Map<OutcomeDocGroupRequest, OutcomeDocGroup>(outcomeDocGroup);
        newOutcomeDocGroup.DisputeGuid = disputeGuid;
        newOutcomeDocGroup.IsDeleted = false;

        var outcomeDocGroupResult = await UnitOfWork.OutcomeDocGroupRepository.InsertAsync(newOutcomeDocGroup);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<OutcomeDocGroup, OutcomeDocGroupResponse>(outcomeDocGroupResult);
        }

        return null;
    }

    public async Task<OutcomeDocGroup> PatchAsync(OutcomeDocGroup outcomeDocGroup)
    {
        UnitOfWork.OutcomeDocGroupRepository.Attach(outcomeDocGroup);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return outcomeDocGroup;
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int outcomeDocGroupId)
    {
        var outcomeDocGroup = await UnitOfWork.OutcomeDocGroupRepository.GetByIdAsync(outcomeDocGroupId);
        if (outcomeDocGroup != null)
        {
            outcomeDocGroup.IsDeleted = true;
            UnitOfWork.OutcomeDocGroupRepository.Attach(outcomeDocGroup);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<OutcomeDocGroupFullResponse> GetByIdAsync(int outcomeDocGroupId)
    {
        var outcomeDocGroup = await UnitOfWork.OutcomeDocGroupRepository.GetByIdWithIncludeAsync(outcomeDocGroupId);
        if (outcomeDocGroup != null)
        {
            return MapperService.Map<OutcomeDocGroup, OutcomeDocGroupFullResponse>(outcomeDocGroup);
        }

        return null;
    }

    public async Task<List<OutcomeDocGroupFullResponse>> GetAllAsync(Guid disputeGuid)
    {
        var outcomeDocGroups =
            await UnitOfWork.OutcomeDocGroupRepository.GetByDisputeGuidWithIncludeAsync(disputeGuid);

        if (outcomeDocGroups != null)
        {
            return MapperService.Map<List<OutcomeDocGroup>, List<OutcomeDocGroupFullResponse>>(outcomeDocGroups);
        }

        return new List<OutcomeDocGroupFullResponse>();
    }

    public async Task<OutcomeDocGroup> GetNoTrackingOutcomeDocGroupAsync(int outcomeDocGroupId)
    {
        var outcomeDocGroup = await UnitOfWork.OutcomeDocGroupRepository.GetNoTrackingByIdAsync(r =>
            r.OutcomeDocGroupId == outcomeDocGroupId);
        return outcomeDocGroup;
    }

    public async Task<bool> OutcomeDocGroupExists(int outcomeDocGroupId)
    {
        var outcomeDocGroup = await UnitOfWork.OutcomeDocGroupRepository.GetByIdAsync(outcomeDocGroupId);
        if (outcomeDocGroup != null)
        {
            return true;
        }

        return false;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.OutcomeDocGroupRepository.GetLastModifiedDate((int)id);

        return lastModifiedDate;
    }

    public async Task<List<ExternalOutcomeDocGroupResponse>> GetExternalOutcomeDocGroups(Guid disputeGuid, ExternalOutcomeDocGroupRequest request)
    {
        var outcomeDocGroups =
            await UnitOfWork.OutcomeDocGroupRepository.GetExternalOutcomeDocGroups(disputeGuid, request);

        if (outcomeDocGroups != null)
        {
            return MapperService.Map<List<OutcomeDocGroup>, List<ExternalOutcomeDocGroupResponse>>(outcomeDocGroups);
        }

        return new List<ExternalOutcomeDocGroupResponse>();
    }
}