using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;
using Guid = System.Guid;

namespace CM.Data.Repositories.Claim;

public class ClaimRepository : CmRepository<Model.Claim>, IClaimRepository
{
    public ClaimRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<Model.Claim> GetClaimById(int claimId)
    {
        var claim = await Context.Claims.SingleOrDefaultAsync(c => c.ClaimId == claimId);
        return claim;
    }

    public async Task<List<Model.Claim>> GetClaimsWithChildrenByGroup(int claimGroupId)
    {
        var claims = await Context.Claims
            .Include(fd => fd.FileDescriptions)
            .Include(cd => cd.ClaimDetails)
            .Include(r => r.Remedies)
            .Where(x => x.ClaimGroupId.Equals(claimGroupId))
            .ToListAsync();

        return claims;
    }

    public async Task<Model.Claim> GetClaimWithChildren(int claimId)
    {
        var claim = await Context.Claims
            .Include(c => c.Remedies)
            .ThenInclude(r => r.RemedyDetails)
            .Include(c => c.ClaimDetails)
            .SingleOrDefaultAsync(c => c.ClaimId == claimId);

        return claim;
    }

    public async Task<List<byte?>> GetDisputeClaimsCode(Guid disputeGuid)
    {
        var claimGroups = await Context.ClaimGroups
            .Where(d => d.DisputeGuid == disputeGuid)
            .Select(x => x.ClaimGroupId)
            .ToListAsync();

        var claimsCode = await Context.Claims
            .Where(c => claimGroups
            .Contains(c.ClaimGroupId) && c.ClaimStatus != (byte)ClaimStatus.Deleted
                                        && c.ClaimStatus != (byte)ClaimStatus.Removed)
            .Select(x => x.ClaimCode).ToListAsync();

        return claimsCode;
    }

    public async Task<List<Model.Claim>> GetDisputeClaimsWithChildren(Guid disputeGuid)
    {
        var disputeClaims = new List<Model.Claim>();
        var claimGroupIds = await Context.ClaimGroups
            .Where(cg => cg.DisputeGuid == disputeGuid)
            .Select(cg => cg.ClaimGroupId)
            .ToListAsync();

        if (claimGroupIds != null)
        {
            foreach (var claimGroupId in claimGroupIds)
            {
                var claims = await Context.Claims
                    .Include(c => c.Remedies)
                    .ThenInclude(r => r.RemedyDetails)
                    .Include(c => c.ClaimDetails)
                    .Where(c => c.ClaimGroupId == claimGroupId)
                    .ToListAsync();

                disputeClaims.AddRange(claims);
            }
        }

        return disputeClaims;
    }

    public async Task<List<Model.Claim>> GetDisputeClaimsForDisputeAccess(Guid disputeGuid)
    {
        var claimGroupIds = await Context.ClaimGroups
            .Where(cg => cg.DisputeGuid == disputeGuid)
            .Select(cg => cg.ClaimGroupId)
            .ToListAsync();

        if (claimGroupIds != null)
        {
            foreach (var claimGroupId in claimGroupIds)
            {
                var claims = await Context.Claims
                    .Include(c => c.ClaimDetails)
                    .Include(c => c.Remedies).ThenInclude(c => c.RemedyDetails)
                    .Include(c => c.FileDescriptions)
                    .ThenInclude(f => f.LinkedFiles)
                    .Where(c => c.ClaimGroupId == claimGroupId)
                    .ToListAsync();

                return claims;
            }
        }

        return null;
    }

    public async Task<DateTime?> GetLastModifiedDate(int claimId)
    {
        var claims = await Context.Claims
            .Where(c => c.ClaimId == claimId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return claims?.FirstOrDefault();
    }

    public async Task<bool> IsRemedyAssigned(int remedyId)
    {
        var exists = await Context
            .Claims
            .AnyAsync(x => x.Remedies.Select(r => r.RemedyId).Contains(remedyId) &&
                           x.ClaimStatus != (byte?)ClaimStatus.Resolved &&
                           x.ClaimStatus != (byte?)ClaimStatus.Dismiss);
        return exists;
    }
}