using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Claim;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.Claims;

public class ClaimService : CmServiceBase, IClaimService
{
    public ClaimService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entityClaim = await UnitOfWork.ClaimRepository.GetNoTrackingByIdAsync(c => c.ClaimId == id);
        if (entityClaim != null)
        {
            var entityClaimGroup = await UnitOfWork.ClaimGroupRepository.GetNoTrackingByIdAsync(c => c.ClaimGroupId == entityClaim.ClaimGroupId);
            return entityClaimGroup.DisputeGuid;
        }

        return Guid.Empty;
    }

    public async Task<ClaimResponse> CreateAsync(int claimGroupId, ClaimRequest claim)
    {
        var newClaim = MapperService.Map<ClaimRequest, Claim>(claim);
        newClaim.ClaimGroupId = claimGroupId;
        newClaim.IsDeleted = false;

        var claimResult = await UnitOfWork.ClaimRepository.InsertAsync(newClaim);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Claim, ClaimResponse>(claimResult);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int claimId)
    {
        var claim = await UnitOfWork.ClaimRepository.GetByIdAsync(claimId);
        if (claim != null)
        {
            claim.IsDeleted = true;
            UnitOfWork.ClaimRepository.Attach(claim);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<ClaimResponse> PatchAsync(int claimId, ClaimRequest claimRequest)
    {
        var claimToPatch = await UnitOfWork.ClaimRepository.GetNoTrackingByIdAsync(c => c.ClaimId == claimId);
        MapperService.Map(claimRequest, claimToPatch);

        UnitOfWork.ClaimRepository.Attach(claimToPatch);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Claim, ClaimResponse>(claimToPatch);
        }

        return null;
    }

    public async Task<ClaimRequest> GetForPatchAsync(int claimId)
    {
        var claim = await UnitOfWork.ClaimRepository.GetNoTrackingByIdAsync(c => c.ClaimId == claimId);
        return MapperService.Map<Claim, ClaimRequest>(claim);
    }

    public async Task<bool> IfChildClaimElementExist(int claimId)
    {
        var claimDetails = await UnitOfWork.ClaimDetailRepository.FindAllAsync(cd => cd.ClaimId == claimId);
        if (claimDetails is { Count: > 0 })
        {
            return true;
        }

        var remedies = await UnitOfWork.RemedyRepository.FindAllAsync(r => r.ClaimId == claimId);
        if (remedies is { Count: > 0 })
        {
            return true;
        }

        return false;
    }

    public async Task<IssueClaimResponse> GetIssueClaim(int claimId)
    {
        var issueClaim = await UnitOfWork.ClaimRepository.GetClaimWithChildren(claimId);
        if (issueClaim != null)
        {
            return MapperService.Map<Claim, IssueClaimResponse>(issueClaim);
        }

        return null;
    }

    public async Task<List<IssueClaimResponse>> GetDisputeClaims(Guid disputeGuid)
    {
        var disputeClaims = await UnitOfWork.ClaimRepository.GetDisputeClaimsWithChildren(disputeGuid);

        if (disputeClaims != null)
        {
            return MapperService.Map<List<Claim>, List<IssueClaimResponse>>(disputeClaims);
        }

        return new List<IssueClaimResponse>();
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.ClaimRepository.GetLastModifiedDate((int)id);
        return lastModifiedDate;
    }

    public async Task<bool> ClaimExists(int claimId)
    {
        var claim = await UnitOfWork.ClaimRepository.GetClaimById(claimId);
        return claim != null;
    }
}