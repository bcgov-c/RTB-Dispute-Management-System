using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Claim;
using CM.Business.Services.Base;

namespace CM.Business.Services.Claims;

public interface IClaimService : IServiceBase, IDisputeResolver
{
    Task<ClaimResponse> CreateAsync(int claimGroupId, ClaimRequest claim);

    Task<bool> DeleteAsync(int claimId);

    Task<ClaimResponse> PatchAsync(int claimId, ClaimRequest claimRequest);

    Task<ClaimRequest> GetForPatchAsync(int claimId);

    Task<bool> IfChildClaimElementExist(int claimId);

    Task<IssueClaimResponse> GetIssueClaim(int claimId);

    Task<List<IssueClaimResponse>> GetDisputeClaims(Guid disputeGuid);

    Task<bool> ClaimExists(int claimId);
}