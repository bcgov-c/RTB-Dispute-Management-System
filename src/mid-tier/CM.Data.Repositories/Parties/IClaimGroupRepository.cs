using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Parties;

public interface IClaimGroupRepository : IRepository<ClaimGroup>
{
    Task<List<ClaimGroup>> GetDisputeClaimGroups(Guid disputeGuid);

    Task<List<ClaimGroup>> GetDisputeClaimGroupsWithParties(Guid disputeGuid);
}