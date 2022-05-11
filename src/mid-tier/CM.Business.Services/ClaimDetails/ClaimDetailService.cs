using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.ClaimDetail;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.ClaimDetails;

public class ClaimDetailService : CmServiceBase, IClaimDetailService
{
    public ClaimDetailService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entityClaimDetail = await UnitOfWork.ClaimDetailRepository.GetNoTrackingByIdAsync(c => c.ClaimDetailId == id);
        if (entityClaimDetail != null)
        {
            var entityClaim = await UnitOfWork.ClaimRepository.GetNoTrackingByIdAsync(c => c.ClaimId == entityClaimDetail.ClaimId);
            if (entityClaim != null)
            {
                var entityClaimGroup = await UnitOfWork.ClaimGroupRepository.GetNoTrackingByIdAsync(c => c.ClaimGroupId == entityClaim.ClaimGroupId);
                return entityClaimGroup.DisputeGuid;
            }
        }

        return Guid.Empty;
    }

    public async Task<ClaimDetailResponse> CreateAsync(int claimId, ClaimDetailRequest claimDetail)
    {
        var newClaimDetail = MapperService.Map<ClaimDetailRequest, ClaimDetail>(claimDetail);
        newClaimDetail.ClaimId = claimId;
        newClaimDetail.IsDeleted = false;

        var claimDetailResult = await UnitOfWork.ClaimDetailRepository.InsertAsync(newClaimDetail);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<ClaimDetail, ClaimDetailResponse>(claimDetailResult);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int claimDetailId)
    {
        var claimDetail = await UnitOfWork.ClaimDetailRepository.GetByIdAsync(claimDetailId);
        if (claimDetail != null)
        {
            claimDetail.IsDeleted = true;
            UnitOfWork.ClaimDetailRepository.Attach(claimDetail);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<ClaimDetailResponse> PatchAsync(int claimDetailId, ClaimDetailRequest claimDetailRequest)
    {
        var claimDetailToPatch = await UnitOfWork.ClaimDetailRepository.GetNoTrackingByIdAsync(cd => cd.ClaimDetailId == claimDetailId);

        MapperService.Map(claimDetailRequest, claimDetailToPatch);

        UnitOfWork.ClaimDetailRepository.Attach(claimDetailToPatch);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<ClaimDetail, ClaimDetailResponse>(claimDetailToPatch);
        }

        return null;
    }

    public async Task<ClaimDetailRequest> GetForPatchAsync(int claimDetailId)
    {
        var claimDetail = await UnitOfWork.ClaimDetailRepository.GetNoTrackingByIdAsync(
            cd => cd.ClaimDetailId == claimDetailId);
        return MapperService.Map<ClaimDetail, ClaimDetailRequest>(claimDetail);
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.ClaimDetailRepository.GetLastModifiedDate((int)id);
        return lastModifiedDate;
    }
}