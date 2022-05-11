using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.OutcomeDocument;

public interface IOutcomeDocGroupRepository : IRepository<OutcomeDocGroup>
{
    Task<OutcomeDocGroup> GetByIdWithIncludeAsync(int outcomeDocGroupId);

    Task<List<OutcomeDocGroup>> GetByDisputeGuidWithIncludeAsync(Guid disputeGuid);

    Task<DateTime?> GetLastModifiedDate(int outcomeDocGroupId);

    Task<List<OutcomeDocGroup>> GetByDisputeGuidWithDocuments(Guid disputeGuid, bool includeNonDeliveredOutcomeDocs);

    Task<OutcomeDocGroup> GetDocGroup(Guid disputeGuid, int outcomeDocGroupId);
}