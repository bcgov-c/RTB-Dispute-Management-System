using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Parties;
using CM.Business.Services.Base;

namespace CM.Business.Services.Parties;

public interface IClaimGroupService : IDisputeResolver
{
    Task<ClaimGroupResponse> Create(Guid disputeGuid);

    Task<bool> ClaimGroupExists(int claimGroupId);

    Task<bool> ClaimGroupExists(Guid disputeGuid);
}