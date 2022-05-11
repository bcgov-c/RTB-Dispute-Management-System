using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Parties;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.Parties;

public class ClaimGroupService : CmServiceBase, IClaimGroupService
{
    public ClaimGroupService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entity = await UnitOfWork.ClaimGroupRepository.GetNoTrackingByIdAsync(x => x.ClaimGroupId == id);
        return entity?.DisputeGuid ?? Guid.Empty;
    }

    public async Task<ClaimGroupResponse> Create(Guid disputeGuid)
    {
        var claimGroup = new ClaimGroup
        {
            DisputeGuid = disputeGuid,
            IsDeleted = false
        };

        var claimGroupResult = await UnitOfWork.ClaimGroupRepository.InsertAsync(claimGroup);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<ClaimGroup, ClaimGroupResponse>(claimGroupResult);
        }

        return null;
    }

    public async Task<bool> ClaimGroupExists(int claimGroupId)
    {
        var claimGroup = await UnitOfWork.ClaimGroupRepository.GetByIdAsync(claimGroupId);
        return claimGroup != null;
    }

    public async Task<bool> ClaimGroupExists(Guid disputeGuid)
    {
        var claimGroups = await UnitOfWork.ClaimGroupRepository.GetDisputeClaimGroups(disputeGuid);
        if (claimGroups != null && claimGroups.Any())
        {
            return true;
        }

        return false;
    }
}