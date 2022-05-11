using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Business.Services.Base;
using CM.Data.Model;

namespace CM.Business.Services.OutcomeDocument;

public interface IOutcomeDocGroupService : IServiceBase, IDisputeResolver
{
    Task<OutcomeDocGroupResponse> CreateAsync(Guid disputeGuid, OutcomeDocGroupRequest outcomeDocGroup);

    Task<OutcomeDocGroup> PatchAsync(OutcomeDocGroup outcomeDocGroup);

    Task<bool> DeleteAsync(int outcomeDocGroupId);

    Task<OutcomeDocGroupFullResponse> GetByIdAsync(int outcomeDocGroupId);

    Task<List<OutcomeDocGroupFullResponse>> GetAllAsync(Guid disputeGuid);

    Task<OutcomeDocGroup> GetNoTrackingOutcomeDocGroupAsync(int outcomeDocGroupId);

    Task<bool> OutcomeDocGroupExists(int outcomeDocGroupId);
}