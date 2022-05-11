using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Payment;
using CM.Business.Services.Base;

namespace CM.Business.Services.Payment;

public interface IDisputeFeeService : IServiceBase, IDisputeResolver
{
    Task<DisputeFeeResponse> CreateAsync(Guid disputeGuid, DisputeFeeRequest disputeFee);

    Task<DisputeFeeResponse> PatchAsync(int disputeFeeId, PatchDisputeFeeRequest disputeFeeRequest);

    Task<bool> DeleteAsync(int disputeFeeId);

    Task<PatchDisputeFeeRequest> GetForPatchAsync(int disputeFeeId);

    Task<DisputeFeeResponse> GetAsync(int disputeFeeId);

    Task<List<GetDisputeFeeResponse>> GetList(Guid disputeGuid);

    Task<bool> DisputeFeeExists(int disputeFeeId);

    Task<bool> ChildElementExists(int disputeFeeId);
}