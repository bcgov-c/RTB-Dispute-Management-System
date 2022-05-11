using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.DisputeProcessDetail;
using CM.Business.Services.Base;

namespace CM.Business.Services.DisputeProcessDetail;

public interface IDisputeProcessDetailService : IServiceBase, IDisputeResolver
{
    Task<DisputeProcessDetailResponse> CreateAsync(Guid disputeGuid, DisputeProcessDetailPostRequest request);

    Task<DisputeProcessDetailResponse> PatchAsync(int disputeProcessDetailId, DisputeProcessDetailPatchRequest request);

    Task<DisputeProcessDetailPatchRequest> GetForPatchAsync(int disputeProcessDetailId);

    Task<bool> DeleteAsync(int disputeProcessDetailId);

    Task<DisputeProcessDetailResponse> GetByIdAsync(int disputeProcessDetailId);

    Task<ICollection<DisputeProcessDetailResponse>> GetAllAsync(Guid disputeGuid);

    Task<bool> AssociatedProcessIsUsed(byte associatedProcess, Guid disputeGuid);
}