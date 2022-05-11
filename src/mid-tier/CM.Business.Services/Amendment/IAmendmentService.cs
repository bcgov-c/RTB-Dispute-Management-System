using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Amendment;
using CM.Business.Services.Base;

namespace CM.Business.Services.Amendment;

public interface IAmendmentService : IServiceBase, IDisputeResolver
{
    Task<AmendmentResponse> CreateAsync(Guid disputeGuid, AmendmentRequest request);

    Task<AmendmentResponse> PatchAsync(int amendmentId, AmendmentRequest amendmentRequest);

    Task<AmendmentRequest> GetForPatchAsync(int amendmentId);

    Task<AmendmentResponse> GetAsync(int amendmentId);

    Task<List<AmendmentResponse>> GetByDisputeAsync(Guid disputeGuid);
}