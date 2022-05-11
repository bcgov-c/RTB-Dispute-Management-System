using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Claim;

public interface IClaimRepository : IRepository<Model.Claim>
{
    Task<Model.Claim> GetClaimById(int claimId);

    Task<Model.Claim> GetClaimWithChildren(int claimId);

    Task<List<Model.Claim>> GetDisputeClaimsWithChildren(Guid disputeGuid);

    Task<List<Model.Claim>> GetDisputeClaimsForDisputeAccess(Guid disputeGuid);

    Task<DateTime?> GetLastModifiedDate(int claimId);

    Task<List<Model.Claim>> GetClaimsWithChildrenByGroup(int claimGroupId);

    Task<List<byte?>> GetDisputeClaimsCode(Guid disputeGuid);

    Task<bool> IsRemedyAssigned(int remedyId);
}