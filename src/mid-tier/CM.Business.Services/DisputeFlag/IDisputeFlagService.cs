using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.DisputeFlag;
using CM.Business.Services.Base;
using CM.Data.Model;

namespace CM.Business.Services.DisputeFlag;

public interface IDisputeFlagService : IServiceBase, IDisputeResolver
{
    Task<PostDisputeFlagResponse> CreateAsync(Guid disputeGuid, PostDisputeFlagRequest request);

    Task<PatchDisputeFlagRequest> GetForPatchAsync(int disputeFlagId);

    Task<PostDisputeFlagResponse> PatchAsync(int disputeFlagId, PatchDisputeFlagRequest disputeFlagRequest);

    Task<bool> DeleteAsync(int disputeFlagId);

    Task<PostDisputeFlagResponse> GetAsync(int disputeFlagId);

    Task<Data.Model.DisputeFlag> GetById(int disputeFlagId);

    Task<List<PostDisputeFlagResponse>> GetList(Guid disputeGuid);

    Task<List<PostDisputeFlagResponse>> GetLinkedFlags(Guid disputeGuid);

    Task<List<PostDisputeFlagResponse>> GetLinkedFlagsFromHearing(Hearing latestHearing, Guid disputeGuid);
}